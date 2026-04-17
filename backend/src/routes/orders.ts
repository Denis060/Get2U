import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { CreateOrderSchema, UpdateOrderStatusSchema, UpdateAgentLocationSchema, OrderInspectionSchema } from "../types";
import {
  notifyAdminNewOrder,
  notifyCustomerOrderAccepted,
  notifyCustomerOrderCompleted,
} from "../notifications";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const ordersRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/orders - List orders based on role
ordersRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const include = {
    customer: { select: { id: true, name: true, email: true, image: true } },
    agent: { select: { id: true, name: true, email: true, image: true } },
    vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
  };

  let orders;
  if (user.role === "admin") {
    orders = await prisma.order.findMany({ include, orderBy: { createdAt: "desc" } });
  } else if (user.role === "agent") {
    orders = await prisma.order.findMany({
      where: { OR: [{ agentId: user.id }, { status: "pending" }] },
      include,
      orderBy: { createdAt: "desc" },
    });
  } else {
    orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include,
      orderBy: { createdAt: "desc" },
    });
  }

  return c.json({ data: orders });
});

// POST /api/orders - Create an order (customers only)
ordersRouter.post("/", zValidator("json", CreateOrderSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const body = c.req.valid("json");

  // Multi-Role & Subscription Guard
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.subscriptionPlanId && user.role !== "admin") {
    return c.json({ 
      error: { 
        message: "Active subscription required. Please subscribe to a plan to request services.", 
        code: "SUBSCRIPTION_REQUIRED" 
      } 
    }, 403);
  }
  
  const {
    category,
    serviceType,
    pickupAddress,
    dropoffAddress,
    packageType,
    courierService,
    vehicleId,
    carLocation,
    description,
    notes,
    ...dynamicDetails
  } = body as Record<string, any>;

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      category: category,
      serviceType: serviceType,
      pickupAddress: category === "delivery" ? pickupAddress : undefined,
      dropoffAddress: category === "delivery" ? dropoffAddress : undefined,
      packageType: category === "delivery" ? packageType : undefined,
      courierService: category === "delivery" ? courierService : undefined,
      vehicleId: category === "car_service" ? vehicleId : undefined,
      carLocation: category === "car_service" ? carLocation : undefined,
      description: description,
      notes: notes,
      details: Object.keys(dynamicDetails).length > 0 ? dynamicDetails : undefined,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  // Notify admin about the new order (fire-and-forget)
  notifyAdminNewOrder({
    id: order.id,
    serviceType: order.serviceType,
    category: order.category,
    pickupAddress: order.pickupAddress,
    carLocation: order.carLocation,
    customer: { name: order.customer!.name, email: order.customer!.email },
  });

  return c.json({ data: order }, 201);
});

// GET /api/orders/:id - Get order details
ordersRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const order = await prisma.order.findUnique({
    where: { id: c.req.param("id") },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
      inspections: true,
    },
  });

  if (!order) return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);

  if (user.role === "customer" && order.customerId !== user.id)
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  if (user.role === "agent" && order.agentId !== user.id && order.status !== "pending")
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);

  return c.json({ data: order });
});

// PATCH /api/orders/:id/status - Update order status
ordersRouter.patch("/:id/status", zValidator("json", UpdateOrderStatusSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const orderId = c.req.param("id");
  const { status, completionNote } = c.req.valid("json");

  const order = await prisma.order.findUnique({ 
    where: { id: orderId } ,
    include: { inspections: true }
  });
  if (!order) return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);

  // Validation: Require inspection before status changes
  if (user.role === "agent") {
    if (status === "in_progress") {
      const hasPickup = order.inspections.some(i => i.type === "pickup");
      if (!hasPickup) return c.json({ error: { message: "Pickup inspection required before starting job", code: "INSPECTION_REQUIRED" } }, 400);
    }
    if (status === "completed") {
      const hasDropoff = order.inspections.some(i => i.type === "dropoff");
      if (!hasDropoff) return c.json({ error: { message: "Drop-off inspection required before completing job", code: "INSPECTION_REQUIRED" } }, 400);
    }
  }

  if (user.role === "customer") {
    if (order.customerId !== user.id) return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
    if (status !== "cancelled" || order.status !== "pending")
      return c.json({ error: { message: "Customers can only cancel pending orders", code: "BAD_REQUEST" } }, 400);
  }
  if (user.role === "agent" && order.agentId !== user.id)
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status, completionNote: completionNote ?? undefined },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  // Notify customer when their order is completed
  if (status === "completed" && updated.customer) {
    notifyCustomerOrderCompleted({
      serviceType: updated.serviceType,
      customer: { name: updated.customer.name, email: updated.customer.email },
    });
  }

  return c.json({ data: updated });
});

// PATCH /api/orders/:id/accept - Agent accepts an order
ordersRouter.patch("/:id/accept", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  
  console.log(`[AcceptJob] User ${user.email} (Role: ${user.role}) is trying to accept a job.`);
  
  if (user.role !== "agent") {
    return c.json({ 
      error: { 
        message: `Role forbidden: Your current session role is '${user.role}'. Please refresh or re-login to update to 'agent'.`, 
        code: "FORBIDDEN" 
      } 
    }, 403);
  }

  const orderId = c.req.param("id");
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  if (order.status !== "pending") return c.json({ error: { message: "Order is no longer available", code: "BAD_REQUEST" } }, 400);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { agentId: user.id, status: "accepted" },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  // Notify customer that their order was accepted
  if (updated.customer && updated.agent) {
    notifyCustomerOrderAccepted({
      serviceType: updated.serviceType,
      customer: { name: updated.customer.name, email: updated.customer.email },
      agent: { name: updated.agent.name },
    });
  }

  return c.json({ data: updated });
});

// PATCH /api/orders/:id/location - Agent updates their GPS location for an active order
ordersRouter.patch("/:id/location", zValidator("json", UpdateAgentLocationSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  if (user.role !== "agent") return c.json({ error: { message: "Agents only", code: "FORBIDDEN" } }, 403);

  const orderId = c.req.param("id");
  const { lat, lng } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  if (order.agentId !== user.id) return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  if (!["accepted", "in_progress"].includes(order.status))
    return c.json({ error: { message: "Order is not active", code: "BAD_REQUEST" } }, 400);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { agentLat: lat, agentLng: lng, agentUpdatedAt: new Date() },
  });

  return c.json({ data: { lat: updated.agentLat, lng: updated.agentLng, updatedAt: updated.agentUpdatedAt } });
});

// POST /api/orders/:id/inspections - Submit an inspection (agents only)
ordersRouter.post("/:id/inspections", zValidator("json", OrderInspectionSchema), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "agent") {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const orderId = c.req.param("id");
  const { type, photos, notes } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);

  if (order.agentId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }

  const inspection = await prisma.orderInspection.create({
    data: {
      orderId,
      type,
      photos,
      notes,
    },
  });

  return c.json({ data: inspection }, 201);
});

export { ordersRouter };
