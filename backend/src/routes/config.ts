import { Hono } from "hono";
import { prisma } from "../prisma";

const configRouter = new Hono();

// GET /api/config/pricing - Fetch all pricing information
configRouter.get("/pricing", async (c) => {
  const [plans, businessTiers, serviceFees] = await prisma.$transaction([
    prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.businessTier.findMany({ orderBy: { price: "asc" } }),
    prisma.serviceFee.findMany({ orderBy: { baseFee: "asc" } }),
  ]);

  return c.json({
    data: {
      plans,
      businessTiers,
      serviceFees,
    },
  });
});

export { configRouter };
