import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { UpdateProfileSchema, UpdateUserRoleSchema, ApplyAgentSchema } from "../types";

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
      subscriptionPlanId: fullUser.subscriptionPlanId,
      stripeCustomerId: fullUser.stripeCustomerId,
      stripeSubscriptionId: fullUser.stripeSubscriptionId,
      adminRole: fullUser.adminRole,
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
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const { role } = c.req.valid("json");

  // Fetch full user with agent profile to check eligibility
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { agentProfile: true }
  });

  if (!fullUser) {
    return c.json({ error: { message: "User not found", code: "NOT_FOUND" } }, 404);
  }

  const isAdmin = fullUser.role === "admin" || fullUser.adminRole !== null;
  const isApprovedAgent = fullUser.agentProfile?.applicationStatus === "approved";

  // Logic: 
  // 1. Admins can switch freely for testing and can switch back to "admin" if they have an adminRole.
  // 2. Approved agents can switch between 'agent' and 'customer'.
  // 3. New users must apply first.
  const canSwitch = 
    (isAdmin && ["agent", "customer", "admin"].includes(role)) || 
    (isApprovedAgent && ["agent", "customer"].includes(role));

  if (!canSwitch) {
    return c.json({ 
      error: { 
        message: "You must be an approved agent or admin to switch roles.", 
        code: "FORBIDDEN" 
      } 
    }, 403);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: role },
  });

  return c.json({ data: { id: updated.id, role: updated.role } });
});

// POST /api/me/apply-agent - Formal application for vetting
usersRouter.post("/me/apply-agent", zValidator("json", ApplyAgentSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);

  const body = c.req.valid("json");

  // Update Agent Profile
  const agentProfile = await prisma.agentProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: body.bio,
      licenseImageUrl: body.licenseImageUrl,
      idImageUrl: body.idImageUrl,
      applicationStatus: "pending",
    },
    update: {
      bio: body.bio,
      licenseImageUrl: body.licenseImageUrl,
      idImageUrl: body.idImageUrl,
      applicationStatus: "pending",
      rejectionReason: null, // Clear past rejections
    },
  });

  // If vehicle info provided
  if (body.vehicle) {
    await prisma.vehicle.create({
      data: {
        userId: user.id,
        make: body.vehicle.make,
        model: body.vehicle.model,
        year: body.vehicle.year,
        plate: body.vehicle.plate,
        registrationImageUrl: body.vehicle.registrationImageUrl,
        insuranceImageUrl: body.vehicle.insuranceImageUrl,
        carImageUrl: body.vehicle.carImageUrl,
        isVerified: false,
      },
    });
  }

  return c.json({ data: agentProfile });
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
