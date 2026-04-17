import { Hono } from "hono";
import { prisma } from "../prisma";
import Stripe from "stripe";

let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  } else {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Payment features will be disabled.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Stripe:", error);
}

const paymentsRouter = new Hono();

// Middleware to ensure stripe is initialized for payment routes
paymentsRouter.use("*", async (c, next) => {
  if (c.req.path.includes("webhook")) return next();
  if (!stripe) {
    return c.json({ error: "Stripe is not configured on this server." }, 503);
  }
  await next();
});

// POST /api/payments/create-checkout-session
paymentsRouter.post("/create-checkout-session", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { planId } = await c.req.json();
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });

  if (!plan || !plan.stripePriceId) {
    return c.json({ error: "Invalid plan or missing Stripe Price ID" }, 400);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/dashboard?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?status=cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    });

    return c.json({ data: { url: session.url } });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/payments/create-portal-session
paymentsRouter.post("/create-portal-session", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fullUser?.stripeCustomerId) {
    return c.json({ error: "No active Stripe customer found" }, 400);
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: fullUser.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/profile`,
    });

    return c.json({ data: { url: session.url } });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/payments/webhook - Handle Stripe events
paymentsRouter.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature");
  const body = await c.req.raw.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig || "",
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlanId: planId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // Find if this stripe price ID maps to a particular plan
        const priceId = subscription.items.data[0]?.price.id;
        
        // Find user by stripe subscription id
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (user && priceId) {
          const plan = await prisma.subscriptionPlan.findFirst({
            where: { stripePriceId: priceId }
          });
          
          if (plan) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionPlanId: plan.id }
            });
          }
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionPlanId: null,
            stripeSubscriptionId: null, // clear the active subscription
          },
        });
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Log or handle failed subscription payment
        console.warn(`Payment failed for invoice ${invoice.id}, customer: ${invoice.customer}`);
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return c.json({ error: "Internal processing error" }, 500);
  }

  return c.json({ received: true });
});

export { paymentsRouter };
