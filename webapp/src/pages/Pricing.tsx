import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  Tag,
  Truck,
  Car,
  Package,
  Mail,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const DELIVERY_INDIVIDUAL_FEATURES = [
  "Unlimited mail dispatch",
  "Send letters & documents",
  "All courier partners (DHL, FedEx, UPS, USPS)",
  "Priority pickup scheduling",
  "Real-time order tracking",
  "24/7 customer support",
];

const DELIVERY_BUSINESS_FEATURES = [
  "Everything in Individual",
  "Dedicated account manager",
  "Bulk dispatch support",
  "Priority scheduling",
  "Invoice billing",
  "Analytics dashboard",
];

const CAR_FEATURES = [
  "Car wash on-location",
  "Fueling service",
  "Oil change coordination",
  "Vehicle help (battery, tires)",
  "Dedicated service agent",
  "Photo/video proof of completion",
  "24/7 availability",
];

const BUSINESS_TIERS = [
  { plan: "Starter", volume: "1–50 packages/mo", price: "$199.99/mo" },
  { plan: "Growth", volume: "51–200 packages/mo", price: "$349.99/mo" },
  { plan: "Enterprise", volume: "200+ packages/mo", price: "Contact us" },
];

const FAQS = [
  {
    q: "Can I switch plans?",
    a: "Yes, you can upgrade or downgrade anytime. Changes take effect at the start of the next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "New customers get their first request free. No credit card required to start.",
  },
  {
    q: "What couriers do you work with?",
    a: "We partner with DHL, FedEx, UPS, USPS, and a network of local couriers for same-day delivery.",
  },
  {
    q: "How does billing work?",
    a: "Subscriptions renew monthly on the same date you signed up. You can cancel anytime with no penalty.",
  },
];

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
        <Check className="h-2.5 w-2.5 text-emerald-400" />
      </span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 py-4 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-foreground">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          {a}
        </motion.p>
      ) : null}
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="mx-auto max-w-5xl space-y-20 py-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
          <Tag className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Pricing</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Simple, Transparent{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Choose a plan that works for you, or pay as you go.
        </p>
      </motion.div>

      {/* Mail & Package Delivery */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Mail className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Mail &amp; Package Delivery</h2>
            <p className="text-sm text-muted-foreground">
              For individuals and growing businesses
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Individual Card */}
          <motion.div
            variants={fadeUp}
            className="group relative flex flex-col rounded-2xl border border-amber-500/40 bg-card p-6 shadow-lg transition-all duration-300 hover:border-amber-500/70 hover:shadow-amber-500/10 hover:shadow-xl"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent" />
            <div className="relative">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Badge className="mb-3 bg-amber-500 text-amber-950 hover:bg-amber-500">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                  <h3 className="text-xl font-bold">Individual</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <Mail className="h-5 w-5 text-amber-400" />
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">$99.99</span>
                <span className="ml-1 text-muted-foreground">/month</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unlimited mail &amp; package dispatch
                </p>
              </div>

              <ul className="mb-8 space-y-2.5">
                {DELIVERY_INDIVIDUAL_FEATURES.map((f) => (
                  <FeatureItem key={f} text={f} />
                ))}
              </ul>

              <Button
                className="w-full bg-amber-500 text-amber-950 hover:bg-amber-400"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* Business Card */}
          <motion.div
            variants={fadeUp}
            className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-lg ring-1 ring-inset ring-white/5 transition-all duration-300 hover:border-primary/40 hover:shadow-primary/10 hover:shadow-xl"
            style={{
              background:
                "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)) 60%, rgba(251,191,36,0.04) 100%)",
            }}
          >
            <div className="relative">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-3 border-primary/40 text-primary"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    Business
                  </Badge>
                  <h3 className="text-xl font-bold">Business</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-secondary">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Tiered pricing table */}
              <div className="mb-6 overflow-hidden rounded-xl border border-border/40 bg-secondary/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                        Plan
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                        Volume
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUSINESS_TIERS.map((tier, i) => (
                      <tr
                        key={tier.plan}
                        className={
                          i < BUSINESS_TIERS.length - 1
                            ? "border-b border-border/30"
                            : ""
                        }
                      >
                        <td className="px-4 py-3 font-medium">{tier.plan}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {tier.volume}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">
                          {tier.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="mb-8 space-y-2.5">
                {DELIVERY_BUSINESS_FEATURES.map((f) => (
                  <FeatureItem key={f} text={f} />
                ))}
              </ul>

              <Button variant="outline" className="w-full" size="lg">
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Car Concierge */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <Car className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Car Concierge Services</h2>
            <p className="text-sm text-muted-foreground">
              Your car, taken care of — wherever you are
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/60 hover:shadow-emerald-500/10 hover:shadow-xl md:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
          <div className="relative md:flex md:items-start md:gap-12">
            <div className="md:flex-1">
              <Badge className="mb-4 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
                <Car className="mr-1 h-3 w-3" />
                Car Concierge
              </Badge>
              <div className="mb-2">
                <span className="text-4xl font-bold">$89.99</span>
                <span className="ml-1 text-muted-foreground">/month</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                Unlimited car service requests — wash, fuel, oil change &amp;
                more
              </p>
              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 md:w-auto md:min-w-[160px]"
                size="lg"
              >
                Subscribe Now
              </Button>
            </div>
            <ul className="mt-8 space-y-2.5 md:mt-0 md:flex-1">
              {CAR_FEATURES.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Package Pickup Pay-as-you-go */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-secondary to-card p-6 md:p-8"
        >
          <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/3 translate-x-1/3 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold md:text-xl">
                Package Pickup &amp; Courier — Pay As You Go
              </h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground md:text-base">
              No subscription required. You only pay when you ship. We add a
              flat{" "}
              <span className="font-semibold text-foreground">$5.00</span>{" "}
              service fee on top of the courier's standard charge.
            </p>

            {/* Price breakdown */}
            <div className="mb-6 max-w-sm overflow-hidden rounded-xl border border-border/50 bg-background/50">
              <div className="border-b border-border/40 px-4 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Example Breakdown
                </p>
              </div>
              <div className="divide-y divide-border/40">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Courier base charge (DHL, FedEx, etc.)
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    varies
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Get2u Errand service fee
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    $5.00
                  </span>
                </div>
                <div className="flex items-center justify-between bg-secondary/60 px-4 py-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-bold">
                    Courier charge + $5.00
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-5 text-xs text-muted-foreground">
              Courier charges shown at checkout based on package size &amp;
              weight.
            </p>

            <Link to="/new-request?type=pickup_dropoff">
              <Button size="lg" className="gap-2">
                <Truck className="h-4 w-4" />
                Request a Pickup
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-6 text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl border border-border/50 bg-card px-6 py-2">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
