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

// GET /api/config/announcements - Fetch active announcements
configRouter.get("/announcements", async (c) => {
  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ data: announcements });
});

export { configRouter };
