import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
} from "../types";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const ordersRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/orders - List orders based on role
ordersRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  let orders;

  if (user.role === "admin") {
    orders = await prisma.order.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true, image: true } },
        agent: { select: { id: true, name: true, email: true, image: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (user.role === "agent") {
    orders = await prisma.order.findMany({
      where: {
        OR: [
          { agentId: user.id },
          { status: "pending" },
        ],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, image: true } },
        agent: { select: { id: true, name: true, email: true, image: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        customer: { select: { id: true, name: true, email: true, image: true } },
        agent: { select: { id: true, name: true, email: true, image: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return c.json({ data: orders });
});

// POST /api/orders - Create an order (customers only)
ordersRouter.post("/", zValidator("json", CreateOrderSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }
  if (user.role !== "customer") {
    return c.json({ error: { message: "Only customers can create orders", code: "FORBIDDEN" } }, 403);
  }

  const body = c.req.valid("json");

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      category: body.category,
      serviceType: body.serviceType,
      pickupAddress: body.category === "delivery" ? body.pickupAddress : undefined,
      dropoffAddress: body.category === "delivery" ? body.dropoffAddress : undefined,
      packageType: body.category === "delivery" ? body.packageType : undefined,
      courierService: body.category === "delivery" ? body.courierService : undefined,
      vehicleId: body.category === "car_service" ? body.vehicleId : undefined,
      carLocation: body.category === "car_service" ? body.carLocation : undefined,
      description: body.description,
      notes: body.notes,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  return c.json({ data: order }, 201);
});

// GET /api/orders/:id - Get order details
ordersRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const order = await prisma.order.findUnique({
    where: { id: c.req.param("id") },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  // Only allow access to own orders or if agent/admin
  if (user.role === "customer" && order.customerId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }
  if (user.role === "agent" && order.agentId !== user.id && order.status !== "pending") {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }

  return c.json({ data: order });
});

// PATCH /api/orders/:id/status - Update order status
ordersRouter.patch("/:id/status", zValidator("json", UpdateOrderStatusSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const orderId = c.req.param("id");
  const { status, completionNote } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  // Customers can only cancel their own pending orders
  if (user.role === "customer") {
    if (order.customerId !== user.id) {
      return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
    }
    if (status !== "cancelled" || order.status !== "pending") {
      return c.json({ error: { message: "Customers can only cancel pending orders", code: "BAD_REQUEST" } }, 400);
    }
  }

  // Agents can update status of their accepted orders
  if (user.role === "agent") {
    if (order.agentId !== user.id) {
      return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      completionNote: completionNote ?? undefined,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  return c.json({ data: updated });
});

// PATCH /api/orders/:id/accept - Agent accepts an order
ordersRouter.patch("/:id/accept", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }
  if (user.role !== "agent") {
    return c.json({ error: { message: "Only agents can accept orders", code: "FORBIDDEN" } }, 403);
  }

  const orderId = c.req.param("id");
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }
  if (order.status !== "pending") {
    return c.json({ error: { message: "Order is no longer available", code: "BAD_REQUEST" } }, 400);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      agentId: user.id,
      status: "accepted",
    },
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
  });

  return c.json({ data: updated });
});

export { ordersRouter };
