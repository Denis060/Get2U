import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { UpdateProfileSchema, UpdateUserRoleSchema } from "../types";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const usersRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/me - Get current user profile
usersRouter.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      agentProfile: true,
      vehicles: true,
    },
  });

  if (!fullUser) {
    return c.json({ error: { message: "User not found", code: "NOT_FOUND" } }, 404);
  }

  return c.json({
    data: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      image: fullUser.image,
      role: fullUser.role,
      phone: fullUser.phone,
      address: fullUser.address,
      agentProfile: fullUser.agentProfile,
      vehicles: fullUser.vehicles,
      createdAt: fullUser.createdAt.toISOString(),
    },
  });
});

// PATCH /api/me - Update profile
usersRouter.patch("/me", zValidator("json", UpdateProfileSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const body = c.req.valid("json");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: body,
  });

  return c.json({
    data: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      role: updated.role,
      phone: updated.phone,
      address: updated.address,
    },
  });
});

// PATCH /api/me/role - Update role
usersRouter.patch("/me/role", zValidator("json", UpdateUserRoleSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const { role } = c.req.valid("json");

  // Don't allow setting admin role via this endpoint
  if (role === "admin") {
    return c.json({ error: { message: "Cannot self-assign admin role", code: "FORBIDDEN" } }, 403);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
  });

  // Create agent profile if switching to agent
  if (role === "agent") {
    await prisma.agentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  }

  return c.json({
    data: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    },
  });
});

// GET /api/agents - List available agents (admin only)
usersRouter.get("/agents", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }
  if (user.role !== "admin") {
    return c.json({ error: { message: "Admin only", code: "FORBIDDEN" } }, 403);
  }

  const agents = await prisma.user.findMany({
    where: { role: "agent" },
    include: { agentProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    data: agents.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      image: a.image,
      phone: a.phone,
      agentProfile: a.agentProfile,
    })),
  });
});

export { usersRouter };
