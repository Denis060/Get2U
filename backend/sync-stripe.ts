import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching subscription plans from DB...");
  const plans = await prisma.subscriptionPlan.findMany();

  if (plans.length === 0) {
    console.log("No subscription plans found in DB. Make sure you seeded them first!");
    return;
  }

  for (const plan of plans) {
    if (plan.stripePriceId) {
      console.log(`Plan "${plan.name}" already has Stripe Price ID: ${plan.stripePriceId}`);
      continue;
    }

    console.log(`Creating Stripe Product and Price for "${plan.name}"...`);
    const product = await stripe.products.create({
      name: plan.name,
      description: `Get2U ${plan.category} subscription`,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100), // Stripe expects cents
      currency: "usd",
      recurring: { interval: plan.interval as "month" | "year" },
    });

    await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: { stripePriceId: price.id },
    });

    console.log(`✅ Synced "${plan.name}" -> Price ID: ${price.id}`);
  }

  console.log("All pricing synced successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
