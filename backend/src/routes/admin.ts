import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import {
  AdminUpdateRoleSchema,
  AdminApproveAgentSchema,
  AdminAssignAgentSchema,
  UpdateOrderStatusSchema,
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
      agentProfile: {
        select: {
          approved: true,
          rating: true,
          totalJobs: true,
        },
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
    agentProfile: u.agentProfile
      ? {
          approved: u.agentProfile.approved,
          rating: u.agentProfile.rating,
          totalJobs: u.agentProfile.totalJobs,
        }
      : null,
  }));

  return c.json({ data: result });
});

// PATCH /api/admin/users/:id/role — Change user role
adminRouter.patch("/users/:id/role", zValidator("json", AdminUpdateRoleSchema), async (c) => {
  const id = c.req.param("id");
  const { role } = c.req.valid("json");

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: { message: "User not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  return c.json({ data: updated });
});

// PATCH /api/admin/users/:id/approve-agent — Approve or reject agent
adminRouter.patch("/users/:id/approve-agent", zValidator("json", AdminApproveAgentSchema), async (c) => {
  const id = c.req.param("id");
  const { approved } = c.req.valid("json");

  const existing = await prisma.agentProfile.findUnique({ where: { userId: id } });
  if (!existing) {
    return c.json({ error: { message: "Agent profile not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.agentProfile.update({
    where: { userId: id },
    data: { approved },
  });

  return c.json({ data: updated });
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
adminRouter.patch("/orders/:id/assign", zValidator("json", AdminAssignAgentSchema), async (c) => {
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
adminRouter.patch("/orders/:id/status", zValidator("json", UpdateOrderStatusSchema), async (c) => {
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

export { adminRouter };
