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
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  category: "delivery" | "car";
  price: number;
  interval: string;
  features: string[];
  isPopular: boolean;
  stripePriceId?: string;
};

type BusinessTier = {
  id: string;
  plan: string;
  volume: string;
  price: number;
  interval: string;
};

type ServiceFee = {
  id: string;
  name: string;
  description?: string;
  baseFee: number;
  serviceType?: string;
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

  const { data: config, isLoading } = useQuery({
    queryKey: ["public-pricing"],
    queryFn: () => api.get<{ plans: Plan[]; businessTiers: BusinessTier[]; serviceFees: ServiceFee[] }>("/api/config/pricing"),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => api.post<{ url: string }>("/api/payments/create-checkout-session", { planId }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err: any) => {
      if (err.status === 401) {
        toast.error("Please log in to subscribe or request service.");
      } else {
        toast.error(err.message || "Failed to start checkout. Please try again.");
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const deliveryPlans = config?.plans.filter(p => p.category === "delivery") || [];
  const carPlans = config?.plans.filter(p => p.category === "car") || [];

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
          {deliveryPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
                plan.isPopular ? "border-amber-500/40" : "border-border/60"
              )}
            >
              {plan.isPopular && <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />}
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", plan.isPopular ? "bg-amber-500/15" : "bg-secondary")}>
                      <Mail className={cn("h-4 w-4", plan.isPopular ? "text-amber-400" : "text-muted-foreground")} />
                    </div>
                    <div>
                      {plan.isPopular && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-amber-500">Most Popular</span>
                          <Star className="h-3 w-3 text-amber-400" />
                        </div>
                      )}
                      <p className="text-base font-bold text-foreground">{plan.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-xs text-muted-foreground">/{plan.interval === "month" ? "mo" : "yr"}</span>
                  </div>
                </div>
                <ul className="mb-4 space-y-2">
                  {plan.features.map((f) => (
                    <FeatureItem key={f} text={f} />
                  ))}
                </ul>
                <Button 
                   onClick={() => subscribeMutation.mutate(plan.id)}
                   disabled={subscribeMutation.isPending}
                   className={cn("h-12 w-full rounded-xl font-semibold", plan.isPopular ? "bg-amber-500 text-amber-950 hover:bg-amber-400" : "")}
                >
                  {subscribeMutation.isPending && subscribeMutation.variables === plan.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Subscribe Now
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Business Tiers (if any) */}
          {config?.businessTiers && config.businessTiers.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-base font-bold text-foreground">Business Tiers</p>
              </div>
              <div className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-secondary/50">
                {config.businessTiers.map((tier, i) => (
                  <div key={tier.id} className={cn("flex items-center justify-between px-3 py-2.5 text-sm", i < config.businessTiers.length - 1 ? "border-b border-border/30" : "")}>
                    <span className="font-semibold text-foreground">{tier.plan}</span>
                    <span className="text-xs text-muted-foreground">{tier.volume}</span>
                    <span className="font-bold text-primary">${tier.price}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="h-12 w-full rounded-xl font-semibold">Contact Sales</Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Car Concierge */}
      {carPlans.length > 0 && (
        <div className={cn("mb-2 mt-6", px)}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Car Concierge Services
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carPlans.map((plan) => (
              <motion.div
                key={plan.id}
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
                        <p className="text-xs font-bold text-emerald-500">{plan.name}</p>
                        <p className="text-base font-bold text-foreground">Service Access</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-xs text-muted-foreground">/{plan.interval === "month" ? "mo" : "yr"}</span>
                    </div>
                  </div>
                  <ul className="mb-4 space-y-2">
                    {plan.features.map((f) => (
                      <FeatureItem key={f} text={f} />
                    ))}
                  </ul>
                  <Button 
                    onClick={() => subscribeMutation.mutate(plan.id)}
                    disabled={subscribeMutation.isPending}
                    className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                  >
                    {subscribeMutation.isPending && subscribeMutation.variables === plan.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Subscribe Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Package Pickup Pay-as-you-go */}
      {config?.serviceFees.map((fee) => (
        <div key={fee.id} className={cn("mb-2 mt-6", px)}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {fee.name}
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
                <p className="text-base font-bold text-foreground">{fee.name}</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {fee.description || `Flat service fee for ${fee.name}.`}
            </p>

            {/* Price breakdown */}
            <div className="mb-4 overflow-hidden rounded-xl border border-border/50 bg-background/60">
              <div className="border-b border-border/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price Example</p>
              </div>
              <div className="divide-y divide-border/40">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">Service Fee</span>
                  <span className="text-sm font-bold text-primary">${fee.baseFee}</span>
                </div>
                <div className="flex items-center justify-between bg-secondary/60 px-3 py-2.5">
                  <span className="text-sm font-semibold italic text-muted-foreground text-xs">+ Additional courier/product costs</span>
                </div>
              </div>
            </div>

            <Link to="/new-request">
              <Button size="lg" className="h-12 w-full rounded-xl gap-2 font-semibold">
                <Truck className="h-4 w-4" />
                Request Service
              </Button>
            </Link>
          </motion.div>
        </div>
      ))}

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
