import { SERVICE_TYPES, type ServiceType } from "@/types/orders";
import {
  Mail,
  Package,
  Truck,
  Car,
  Fuel,
  Droplets,
  Wrench,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  send_mail: Mail,
  send_package: Package,
  pickup_dropoff: Truck,
  car_wash: Droplets,
  fueling: Fuel,
  oil_change: Wrench,
  vehicle_help: HelpCircle,
};

const SERVICE_ICON_COLORS: Record<string, string> = {
  send_mail: "text-amber-400",
  send_package: "text-blue-400",
  pickup_dropoff: "text-emerald-400",
  car_wash: "text-purple-400",
  fueling: "text-orange-400",
  oil_change: "text-cyan-400",
  vehicle_help: "text-red-400",
};

export function getServiceIcon(serviceType: string): LucideIcon {
  return SERVICE_ICONS[serviceType] ?? Car;
}

export function getServiceIconColor(serviceType: string): string {
  return SERVICE_ICON_COLORS[serviceType] ?? "text-muted-foreground";
}

export function getServiceLabel(serviceType: string): string {
  return SERVICE_TYPES[serviceType as ServiceType]?.label ?? serviceType;
}
