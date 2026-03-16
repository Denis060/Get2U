import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    <div className="border-b border-border/40 py-4 last:border-0">
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
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-muted-foreground overflow-hidden"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const isMobile = useIsMobile();
  const px = isMobile ? "px-4" : "";

  return (
    <div className="space-y-0 pb-6">
      {/* Page header */}
      <div className={cn("pb-4 pt-4", px)}>
        <h1 className="text-2xl font-bold text-foreground">Pricing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Simple, transparent plans for everyone.</p>
      </div>

      {/* Mail & Package Delivery */}
      <div className={cn("mb-2", px)}>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Mail & Package Delivery
        </p>
        <div className={cn("space-y-3", isMobile ? "" : "grid grid-cols-2 gap-4 space-y-0")}>
          {/* Individual Plan */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-card p-5 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
                    <Mail className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-500">Most Popular</span>
                      <Star className="h-3 w-3 text-amber-400" />
                    </div>
                    <p className="text-base font-bold text-foreground">Individual</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">$99.99</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="mb-4 space-y-2">
                {DELIVERY_INDIVIDUAL_FEATURES.map((f) => (
                  <FeatureItem key={f} text={f} />
                ))}
              </ul>
              <Button className="h-12 w-full rounded-xl bg-amber-500 text-amber-950 font-semibold hover:bg-amber-400">
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* Business Plan */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">Business</span>
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-base font-bold text-foreground">Business</p>
                </div>
              </div>
            </div>

            {/* Tiered table */}
            <div className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-secondary/50">
              {BUSINESS_TIERS.map((tier, i) => (
                <div
                  key={tier.plan}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 text-sm",
                    i < BUSINESS_TIERS.length - 1 ? "border-b border-border/30" : ""
                  )}
                >
                  <span className="font-semibold text-foreground">{tier.plan}</span>
                  <span className="text-xs text-muted-foreground">{tier.volume}</span>
                  <span className="font-bold text-primary">{tier.price}</span>
                </div>
              ))}
            </div>

            <ul className="mb-4 space-y-2">
              {DELIVERY_BUSINESS_FEATURES.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>
            <Button variant="outline" className="h-12 w-full rounded-xl font-semibold">
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Car Concierge */}
      <div className={cn("mb-2 mt-6", px)}>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Car Concierge Services
        </p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-card p-5 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Car className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-500">Car Concierge</p>
                  <p className="text-base font-bold text-foreground">All Car Services</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">$89.99</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <ul className="mb-4 space-y-2">
              {CAR_FEATURES.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>
            <Button className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500">
              Subscribe Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Package Pickup Pay-as-you-go */}
      <div className={cn("mb-2 mt-6", px)}>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Pay As You Go
        </p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-secondary p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">No subscription needed</p>
              <p className="text-base font-bold text-foreground">Package Pickup & Courier</p>
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Only pay when you ship. We add a flat{" "}
            <span className="font-semibold text-foreground">$5.00</span>{" "}
            service fee on top of the courier's standard charge.
          </p>

          {/* Price breakdown */}
          <div className="mb-4 overflow-hidden rounded-xl border border-border/50 bg-background/60">
            <div className="border-b border-border/40 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Example Breakdown</p>
            </div>
            <div className="divide-y divide-border/40">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-muted-foreground">Courier base charge</span>
                <span className="text-sm font-medium text-muted-foreground">varies</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-muted-foreground">Get2u service fee</span>
                <span className="text-sm font-bold text-primary">$5.00</span>
              </div>
              <div className="flex items-center justify-between bg-secondary/60 px-3 py-2.5">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-sm font-bold">Courier + $5.00</span>
              </div>
            </div>
          </div>

          <Link to="/new-request?type=pickup_dropoff">
            <Button size="lg" className="h-12 w-full rounded-xl gap-2 font-semibold">
              <Truck className="h-4 w-4" />
              Request a Pickup
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className={cn("mt-6", px)}>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">FAQ</p>
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card px-4 py-2">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
