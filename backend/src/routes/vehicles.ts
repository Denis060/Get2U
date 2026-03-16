import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { CreateVehicleSchema } from "../types";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const vehiclesRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/vehicles - List user's vehicles
vehiclesRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: vehicles });
});

// POST /api/vehicles - Add a vehicle
vehiclesRouter.post("/", zValidator("json", CreateVehicleSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const body = c.req.valid("json");

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      ...body,
    },
  });

  return c.json({ data: vehicle }, 201);
});

// DELETE /api/vehicles/:id - Remove a vehicle
vehiclesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const vehicleId = c.req.param("id");
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) {
    return c.json({ error: { message: "Vehicle not found", code: "NOT_FOUND" } }, 404);
  }
  if (vehicle.userId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } });

  return c.body(null, 204);
});

export { vehiclesRouter };
