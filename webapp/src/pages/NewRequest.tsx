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
} from "lucide-react";
import { api } from "@/lib/api";
import type { OrderResponse } from "@/types/orders";
import StepIndicator from "@/components/StepIndicator";
import DeliveryRequestForm from "@/components/forms/DeliveryRequestForm";
import CarRequestForm from "@/components/forms/CarRequestForm";
import ReviewSubmit from "@/components/forms/ReviewSubmit";
import { cn } from "@/lib/utils";

const DELIVERY_SERVICES = [
  { type: "send_mail", label: "Send Mail", desc: "Letters, documents & envelopes", icon: Mail, color: "bg-amber-50 text-amber-500 border-amber-200" },
  { type: "send_package", label: "Send Package", desc: "Any size packages, nationwide", icon: Package, color: "bg-blue-50 text-blue-500 border-blue-200" },
  { type: "pickup_dropoff", label: "Pickup & Drop-off", desc: "Pick up and deliver your items", icon: Truck, color: "bg-emerald-50 text-emerald-500 border-emerald-200" },
];

const CAR_SERVICES = [
  { type: "car_wash", label: "Car Wash", desc: "Professional washing & detailing", icon: Droplets, color: "bg-purple-50 text-purple-500 border-purple-200" },
  { type: "fueling", label: "Fueling", desc: "Fuel delivered to your car", icon: Fuel, color: "bg-orange-50 text-orange-500 border-orange-200" },
  { type: "oil_change", label: "Oil Change", desc: "Quick & convenient oil change", icon: Wrench, color: "bg-cyan-50 text-cyan-500 border-cyan-200" },
  { type: "vehicle_help", label: "Vehicle Help", desc: "Roadside & emergency assistance", icon: HelpCircle, color: "bg-red-50 text-red-500 border-red-200" },
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error("Failed to submit order", err);
      setIsSubmitting(false);
    }
  };

  const isDelivery = selectedService ? DELIVERY_TYPES.has(selectedService) : false;

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => goTo((step - 1) as 1 | 2 | 3, -1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Request</h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? "Choose a service to get started" : step === 2 ? "Fill in your request details" : "Review before confirming"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} steps={STEP_LABELS} />

      {/* Animated step content */}
      <div className="overflow-hidden">
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
              <div className="space-y-6">
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
    </div>
  );
}

interface ServiceItem {
  type: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function ServiceSection({ title, services, onSelect }: { title: string; services: ServiceItem[]; onSelect: (type: string) => void }) {
  return (
    <section>
      <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(24_95%_48%)]">{title}</h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <motion.button
              key={svc.type}
              type="button"
              onClick={() => onSelect(svc.type)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]",
                svc.color.split(" ").find((c) => c.startsWith("border-")) ?? "border-gray-200"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", svc.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{svc.label}</p>
                <p className="text-xs text-gray-500">{svc.desc}</p>
              </div>
              <ChevronLeft className="ml-auto h-4 w-4 rotate-180 text-gray-300" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
