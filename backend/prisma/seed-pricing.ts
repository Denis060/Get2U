import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Subscription Plans
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: "Individual",
        category: "delivery",
        price: 99.99,
        interval: "month",
        features: ["Unlimited mail dispatch", "Send letters & documents", "All courier partners", "Real-time tracking"],
        isPopular: true,
      },
      {
        name: "Car Concierge",
        category: "car",
        price: 89.99,
        interval: "month",
        features: ["Car wash on-location", "Fueling service", "Oil change coordination", "Vehicle help (battery, tires)"],
        isPopular: false,
      },
    ],
  });

  // 2. Business Tiers
  await prisma.businessTier.createMany({
    data: [
      { plan: "Starter", volume: "1–50 packages/mo", price: 199.99, interval: "month" },
      { plan: "Growth", volume: "51–200 packages/mo", price: 349.99, interval: "month" },
    ],
  });

  // 3. Service Fees
  await prisma.serviceFee.createMany({
    data: [
      { name: "Pay As You Go", description: "Flat fee per package delivery", baseFee: 5.00, serviceType: "package_pickup" },
    ],
  });

  console.log("Pricing seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
