import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Package,
  Truck,
  Droplets,
  Fuel,
  Wrench,
  HelpCircle,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import DeliveryForm from "@/components/DeliveryForm";
import CarServiceForm from "@/components/CarServiceForm";

const DELIVERY_SERVICES = [
  { type: "send_mail", label: "Send Mail", desc: "Letters & documents", icon: Mail, color: "bg-amber-500/15 text-amber-400" },
  { type: "send_package", label: "Send Package", desc: "Any size packages", icon: Package, color: "bg-blue-500/15 text-blue-400" },
  { type: "pickup_dropoff", label: "Pickup & Drop-off", desc: "Pick up and deliver items", icon: Truck, color: "bg-emerald-500/15 text-emerald-400" },
];

const CAR_SERVICES = [
  { type: "car_wash", label: "Car Wash", desc: "Professional washing", icon: Droplets, color: "bg-purple-500/15 text-purple-400" },
  { type: "fueling", label: "Fueling", desc: "Fuel delivery", icon: Fuel, color: "bg-orange-500/15 text-orange-400" },
  { type: "oil_change", label: "Oil Change", desc: "Quick oil change", icon: Wrench, color: "bg-cyan-500/15 text-cyan-400" },
  { type: "vehicle_help", label: "Vehicle Help", desc: "Roadside assistance", icon: HelpCircle, color: "bg-red-500/15 text-red-400" },
];

const DELIVERY_TYPES = new Set(["send_mail", "send_package", "pickup_dropoff"]);

export default function NewRequest() {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const preselect = searchParams.get("type");
    if (preselect) {
      setSelected(preselect);
    }
  }, [searchParams]);

  const isDelivery = selected ? DELIVERY_TYPES.has(selected) : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">New Request</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a service to get started</p>
      </div>

      {/* Delivery Services */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Delivery Services
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERY_SERVICES.map((svc) => (
            <ServiceCard
              key={svc.type}
              icon={svc.icon}
              label={svc.label}
              description={svc.desc}
              color={svc.color}
              selected={selected === svc.type}
              onClick={() => setSelected(selected === svc.type ? null : svc.type)}
            />
          ))}
        </div>
      </section>

      {/* Car Services */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Car Services
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAR_SERVICES.map((svc) => (
            <ServiceCard
              key={svc.type}
              icon={svc.icon}
              label={svc.label}
              description={svc.desc}
              color={svc.color}
              selected={selected === svc.type}
              onClick={() => setSelected(selected === svc.type ? null : svc.type)}
            />
          ))}
        </div>
      </section>

      {/* Form */}
      <AnimatePresence mode="wait">
        {selected && isDelivery ? (
          <motion.div key={`delivery-${selected}`}>
            <DeliveryForm serviceType={selected} />
          </motion.div>
        ) : null}
        {selected && !isDelivery ? (
          <motion.div key={`car-${selected}`}>
            <CarServiceForm serviceType={selected} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
