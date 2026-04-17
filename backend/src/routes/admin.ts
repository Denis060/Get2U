import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import {
  AdminUpdateRoleSchema,
  AdminApproveAgentSchema,
  AdminAssignAgentSchema,
  UpdateOrderStatusSchema,
  UpdateSubscriptionPlanSchema,
  UpdateBusinessTierSchema,
  UpdateServiceFeeSchema,
} from "../types";

type SessionUser = typeof auth.$Infer.Session.user & { role: string };

type AuthVariables = {
  user: SessionUser | null;
  session: typeof auth.$Infer.Session.session | null;
};

const adminRouter = new Hono<{ Variables: AuthVariables }>();

// Admin guard middleware
adminRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }
  if (user.role !== "admin") {
    return c.json({ error: { message: "Forbidden: admin access required", code: "FORBIDDEN" } }, 403);
  }
  await next();
});

// Permission helper
const requireRoles = (allowedRoles: string[]) => {
  return async (c: any, next: any) => {
    const user = c.get("user");
    // super_admin always has access
    if (user.adminRole === "super_admin") return await next();
    
    if (!user.adminRole || !allowedRoles.includes(user.adminRole)) {
      return c.json({ error: { message: "Forbidden: insufficient permissions", code: "FORBIDDEN" } }, 403);
    }
    await next();
  };
};

// GET /api/admin/stats — Dashboard statistics
adminRouter.get("/stats", async (c) => {
  const [
    totalCustomers,
    totalAgents,
    totalOrders,
    pendingOrders,
    activeOrders,
    completedOrders,
    totalMessages,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "agent" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: { in: ["accepted", "in_progress"] } } }),
    prisma.order.count({ where: { status: "completed" } }),
    prisma.message.count(),
  ]);

  return c.json({
    data: {
      totalCustomers,
      totalAgents,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      totalMessages,
    },
  });
});

// GET /api/admin/analytics — Detailed historical data for charts
adminRouter.get("/analytics", async (c) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [orders, users] = await prisma.$transaction([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, serviceType: true, finalPrice: true, category: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, role: true },
    }),
  ]);

  // Aggregate Orders per Day
  const orderTrends: Record<string, { date: string; count: number; revenue: number }> = {};
  // Aggregate Service Distribution
  const serviceStats: Record<string, number> = {};
  
  // Fill 30 day gaps
  for (let i = 0; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    orderTrends[dateStr] = { date: dateStr, count: 0, revenue: 0 };
  }

  orders.forEach((o) => {
    const dateStr = o.createdAt.toISOString().split("T")[0];
    if (orderTrends[dateStr]) {
      orderTrends[dateStr].count += 1;
      orderTrends[dateStr].revenue += (o.finalPrice || 0);
    }
    serviceStats[o.serviceType] = (serviceStats[o.serviceType] || 0) + 1;
  });

  // Aggregate User Growth
  const userTrends: Record<string, { date: string; customers: number; agents: number }> = {};
  for (let i = 0; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    userTrends[dateStr] = { date: dateStr, customers: 0, agents: 0 };
  }

  users.forEach((u) => {
    const dateStr = u.createdAt.toISOString().split("T")[0];
    if (userTrends[dateStr]) {
      if (u.role === "agent") userTrends[dateStr].agents += 1;
      else userTrends[dateStr].customers += 1;
    }
  });

  return c.json({
    data: {
      orderTrends: Object.values(orderTrends).reverse(),
      userTrends: Object.values(userTrends).reverse(),
      serviceDistribution: Object.entries(serviceStats).map(([name, value]) => ({ name, value })),
    },
  });
});

// GET /api/admin/users — List all users with stats
adminRouter.get("/users", async (c) => {
  const roleFilter = c.req.query("role");
  const search = c.req.query("search");

  const where: {
    role?: string;
    OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
  } = {};

  if (roleFilter) {
    where.role = roleFilter;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      agentProfile: true,
      vehicles: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          ordersAsCustomer: true,
          ordersAsAgent: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    createdAt: u.createdAt,
    ordersAsCustomer: u._count.ordersAsCustomer,
    ordersAsAgent: u._count.ordersAsAgent,
    agentProfile: u.agentProfile,
    latestVehicle: u.vehicles[0] || null,
  }));

  return c.json({ data: result });
});

// PATCH /api/admin/users/:id/role — Change user role
adminRouter.patch("/users/:id/role", zValidator("json", AdminUpdateRoleSchema), async (c) => {
  const id = c.req.param("id");
  const { role, adminRole } = c.req.valid("json");

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: { message: "User not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { 
      role,
      adminRole: role === "admin" ? (adminRole ?? "support") : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminRole: true,
      phone: true,
      createdAt: true,
    },
  });

  return c.json({ data: updated });
});

// PATCH /api/admin/users/:id/approve-agent — Approve or reject agent
adminRouter.patch("/users/:id/approve-agent", requireRoles(["vetting_officer"]), zValidator("json", AdminApproveAgentSchema), async (c) => {
  const userId = c.req.param("id");
  const { status, rejectionReason } = c.req.valid("json");

  const existing = await prisma.agentProfile.findUnique({ where: { userId } });
  if (!existing) {
    return c.json({ error: { message: "Agent profile not found", code: "NOT_FOUND" } }, 404);
  }

  // Update Agent Profile
  const updatedProfile = await prisma.agentProfile.update({
    where: { userId },
    data: { 
      applicationStatus: status,
      rejectionReason: status === "rejected" ? rejectionReason : null,
    },
  });

  // If approved, graduate the user role to agent and verify their latest vehicle
  if (status === "approved") {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "agent" },
    });

    // Verify the latest vehicle automatically
    const latestVehicle = await prisma.vehicle.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    if (latestVehicle) {
      await prisma.vehicle.update({
        where: { id: latestVehicle.id },
        data: { isVerified: true },
      });
    }
  }

  return c.json({ data: updatedProfile });
});

// DELETE /api/admin/users/:id — Delete a user (cannot delete self)
adminRouter.delete("/users/:id", async (c) => {
  const adminUser = c.get("user")!;
  const id = c.req.param("id");

  if (id === adminUser.id) {
    return c.json({ error: { message: "Cannot delete your own account", code: "BAD_REQUEST" } }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: { message: "User not found", code: "NOT_FOUND" } }, 404);
  }

  await prisma.user.delete({ where: { id } });

  return c.json({ data: { success: true } });
});

// GET /api/admin/orders — List all orders with filters
adminRouter.get("/orders", async (c) => {
  const statusFilter = c.req.query("status");
  const categoryFilter = c.req.query("category");
  const search = c.req.query("search");

  const where: {
    status?: string;
    category?: string;
    OR?: Array<{
      id?: { contains: string };
      customer?: { name?: { contains: string } };
    }>;
  } = {};

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (categoryFilter) {
    where.category = categoryFilter;
  }

  if (search) {
    where.OR = [
      { id: { contains: search } },
      { customer: { name: { contains: search } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, image: true } },
      agent: { select: { id: true, name: true, email: true, image: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, color: true, plate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: orders });
});

// PATCH /api/admin/orders/:id/assign — Assign an agent to an order
adminRouter.patch("/orders/:id/assign", requireRoles(["dispatcher"]), zValidator("json", AdminAssignAgentSchema), async (c) => {
  const id = c.req.param("id");
  const { agentId } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent || agent.role !== "agent") {
    return c.json({ error: { message: "Agent not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      agentId,
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

// PATCH /api/admin/orders/:id/status — Force-update any order status
adminRouter.patch("/orders/:id/status", requireRoles(["dispatcher"]), zValidator("json", UpdateOrderStatusSchema), async (c) => {
  const id = c.req.param("id");
  const { status, completionNote } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.order.update({
    where: { id },
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

// GET /api/admin/pricing-plans - List all plans
adminRouter.get("/pricing-plans", async (c) => {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
  return c.json({ data: plans });
});

// POST /api/admin/pricing-plans - Create a plan
adminRouter.post("/pricing-plans", requireRoles(["finance"]), zValidator("json", UpdateSubscriptionPlanSchema), async (c) => {
  const body = c.req.valid("json");
  const plan = await prisma.subscriptionPlan.create({ data: body });
  return c.json({ data: plan }, 201);
});

// PATCH /api/admin/pricing-plans/:id - Update a plan
adminRouter.patch("/pricing-plans/:id", requireRoles(["finance"]), zValidator("json", UpdateSubscriptionPlanSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const plan = await prisma.subscriptionPlan.update({ where: { id }, data: body });
  return c.json({ data: plan });
});

// DELETE /api/admin/pricing-plans/:id - Delete a plan
adminRouter.delete("/pricing-plans/:id", requireRoles(["super_admin"]), async (c) => {
  const id = c.req.param("id");
  await prisma.subscriptionPlan.delete({ where: { id } });
  return c.json({ data: { success: true } });
});

// CRUD for Business Tiers
adminRouter.get("/business-tiers", async (c) => {
  const tiers = await prisma.businessTier.findMany({ orderBy: { price: "asc" } });
  return c.json({ data: tiers });
});

adminRouter.post("/business-tiers", zValidator("json", UpdateBusinessTierSchema), async (c) => {
  const body = c.req.valid("json");
  const tier = await prisma.businessTier.create({ data: body });
  return c.json({ data: tier }, 201);
});

adminRouter.patch("/business-tiers/:id", zValidator("json", UpdateBusinessTierSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const tier = await prisma.businessTier.update({ where: { id }, data: body });
  return c.json({ data: tier });
});

adminRouter.delete("/business-tiers/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.businessTier.delete({ where: { id } });
  return c.json({ data: { success: true } });
});

// CRUD for Service Fees
adminRouter.get("/service-fees", async (c) => {
  const fees = await prisma.serviceFee.findMany({ orderBy: { baseFee: "asc" } });
  return c.json({ data: fees });
});

adminRouter.post("/service-fees", zValidator("json", UpdateServiceFeeSchema), async (c) => {
  const body = c.req.valid("json");
  const fee = await prisma.serviceFee.create({ data: body });
  return c.json({ data: fee }, 201);
});

adminRouter.patch("/service-fees/:id", zValidator("json", UpdateServiceFeeSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const fee = await prisma.serviceFee.update({ where: { id }, data: body });
  return c.json({ data: fee });
});

// CRUD for Announcements (Marketing)
adminRouter.get("/announcements", async (c) => {
  const ann = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return c.json({ data: ann });
});

adminRouter.post("/announcements", requireRoles(["marketing"]), async (c) => {
  const body = await c.req.json();
  const ann = await prisma.announcement.create({ data: body });
  return c.json({ data: ann }, 201);
});

adminRouter.patch("/announcements/:id", requireRoles(["marketing"]), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const ann = await prisma.announcement.update({ where: { id }, data: body });
  return c.json({ data: ann });
});

adminRouter.delete("/announcements/:id", requireRoles(["marketing"]), async (c) => {
  const id = c.req.param("id");
  await prisma.announcement.delete({ where: { id } });
  return c.json({ data: { success: true } });
});

export { adminRouter };
