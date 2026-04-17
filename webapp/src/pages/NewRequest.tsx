import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Package,
  Truck,
  Droplets,
  Fuel,
  Wrench,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { OrderResponse } from "@/types/orders";
import { SERVICE_TYPES, type ServiceType } from "@/types/orders";
import StepIndicator from "@/components/StepIndicator";
import DeliveryRequestForm from "@/components/forms/DeliveryRequestForm";
import CarRequestForm from "@/components/forms/CarRequestForm";
import ReviewSubmit from "@/components/forms/ReviewSubmit";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SubscriptionGuard from "@/components/SubscriptionGuard";

const DELIVERY_SERVICES = [
  { type: "send_mail", label: "Send Mail", desc: "Letters, documents & envelopes", icon: Mail, bg: "bg-amber-500/15", iconColor: "text-amber-500" },
  { type: "send_package", label: "Send Package", desc: "Any size packages, nationwide", icon: Package, bg: "bg-blue-500/15", iconColor: "text-blue-500" },
  { type: "pickup_dropoff", label: "Pickup & Drop-off", desc: "Pick up and deliver your items", icon: Truck, bg: "bg-emerald-500/15", iconColor: "text-emerald-500" },
];

const CAR_SERVICES = [
  { type: "car_wash", label: "Car Wash", desc: "Professional washing & detailing", icon: Droplets, bg: "bg-purple-500/15", iconColor: "text-purple-500" },
  { type: "fueling", label: "Fueling", desc: "Fuel delivered to your car", icon: Fuel, bg: "bg-orange-500/15", iconColor: "text-orange-500" },
  { type: "oil_change", label: "Oil Change", desc: "Quick & convenient oil change", icon: Wrench, bg: "bg-cyan-500/15", iconColor: "text-cyan-500" },
  { type: "vehicle_help", label: "Vehicle Help", desc: "Roadside & emergency assistance", icon: HelpCircle, bg: "bg-red-500/15", iconColor: "text-red-500" },
];

const DELIVERY_TYPES = new Set(["send_mail", "send_package", "pickup_dropoff"]);
const STEP_LABELS = ["Choose Service", "Fill Details", "Review"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

export default function NewRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    const preselect = searchParams.get("type");
    if (preselect) {
      setSelectedService(preselect);
      setDirection(1);
      setStep(2);
    }
  }, [searchParams]);

  const goTo = (next: 1 | 2 | 3, dir: number) => {
    setDirection(dir);
    setStep(next);
  };

  const handleServiceSelect = (type: string) => {
    setSelectedService(type);
    goTo(2, 1);
  };

  const handleFormComplete = (data: Record<string, unknown>) => {
    setFormData(data);
    goTo(3, 1);
  };

  const handleFinalSubmit = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const isDelivery = DELIVERY_TYPES.has(selectedService);
      const payload = {
        category: isDelivery ? "delivery" : "car_service",
        serviceType: selectedService,
        ...formData,
      };
      const order = await api.post<OrderResponse>("/api/orders", payload);
      setSubmittedOrder(order);
      toast.success("Order submitted successfully!");
    } catch (err: any) {
      console.error("Failed to submit order", err);
      const message = err.response?.data?.error?.message || "Failed to submit order. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const isDelivery = selectedService ? DELIVERY_TYPES.has(selectedService) : false;
  const px = isMobile ? "px-4" : "";

  // Success screen
  if (submittedOrder !== null) {
    const serviceInfo = SERVICE_TYPES[submittedOrder.serviceType as ServiceType];
    const serviceLabel = serviceInfo ? serviceInfo.label : submittedOrder.serviceType;
    return (
      <div className={cn("flex min-h-[80vh] flex-col items-center justify-center pb-10", isMobile ? "px-6" : "mx-auto max-w-lg px-6")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="flex flex-col items-center text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20"
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl font-bold text-foreground"
          >
            Request Submitted!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Your request has been received. An agent will be assigned shortly.
          </motion.p>

          {/* Order details card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8 w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order ID</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  #{submittedOrder.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service</span>
                <span className="text-sm font-semibold text-foreground">{serviceLabel}</span>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex w-full flex-col gap-3"
          >
            <Button
              className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
              onClick={() => navigate(`/orders/${submittedOrder.id}`)}
            >
              View My Order
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Go to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("pb-10", isMobile ? "" : "mx-auto max-w-lg")}>
      <SubscriptionGuard>
        {/* Native-style page header */}
        <div className={cn("flex items-center gap-3 py-4", px)}>
          {step > 1 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => goTo((step - 1) as 1 | 2 | 3, -1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          ) : (
            <div className="h-9 w-9" />
          )}
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-foreground">New Request</h1>
            <p className="text-xs text-muted-foreground">
              Step {step} of 3
            </p>
          </div>
          <div className="h-9 w-9" />
        </div>

        {/* Step indicator */}
        <div className={cn("mb-5", px)}>
          <StepIndicator currentStep={step} steps={STEP_LABELS} />
        </div>

        {/* Animated step content */}
        <div className={cn("overflow-hidden", px)}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {step === 1 ? (
                <div className="space-y-5">
                  <ServiceSection title="Delivery Services" services={DELIVERY_SERVICES} onSelect={handleServiceSelect} />
                  <ServiceSection title="Car Services" services={CAR_SERVICES} onSelect={handleServiceSelect} />
                </div>
              ) : step === 2 && selectedService ? (
                isDelivery ? (
                  <DeliveryRequestForm
                    serviceType={selectedService}
                    onComplete={handleFormComplete}
                    initialData={formData as Parameters<typeof DeliveryRequestForm>[0]["initialData"]}
                  />
                ) : (
                  <CarRequestForm
                    serviceType={selectedService}
                    onComplete={handleFormComplete}
                    initialData={formData as Parameters<typeof CarRequestForm>[0]["initialData"]}
                  />
                )
              ) : step === 3 && selectedService ? (
                <ReviewSubmit
                  serviceType={selectedService}
                  formData={formData}
                  onEdit={() => goTo(2, -1)}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </SubscriptionGuard>
    </div>
  );
}

interface ServiceItem {
  type: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconColor: string;
}

function ServiceSection({ title, services, onSelect }: { title: string; services: ServiceItem[]; onSelect: (type: string) => void }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
        {services.map((svc, idx) => {
          const Icon = svc.icon;
          return (
            <motion.button
              key={svc.type}
              type="button"
              onClick={() => onSelect(svc.type)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary",
                idx < services.length - 1 ? "border-b border-border/30" : ""
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", svc.bg)}>
                <Icon className={cn("h-5 w-5", svc.iconColor)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{svc.label}</p>
                <p className="text-xs text-muted-foreground">{svc.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
