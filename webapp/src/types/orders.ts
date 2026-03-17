export type OrderResponse = {
  id: string;
  customerId: string;
  agentId: string | null;
  category: string;
  serviceType: string;
  status: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  packageType: string | null;
  courierService: string | null;
  vehicleId: string | null;
  carLocation: string | null;
  description: string | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  notes: string | null;
  completionNote: string | null;
  agentLat: number | null;
  agentLng: number | null;
  agentUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email: string; image: string | null; phone?: string | null };
  agent?: { id: string; name: string; email: string; image: string | null } | null;
  vehicle?: { id: string; make: string; model: string; year: string | null; color: string | null; plate: string | null } | null;
};

export type VehicleResponse = {
  id: string;
  make: string;
  model: string;
  year: string | null;
  color: string | null;
  plate: string | null;
  location: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  phone: string | null;
  address: string | null;
};

export const SERVICE_TYPES = {
  send_mail: { label: "Send Mail", category: "delivery", description: "Send letters and documents" },
  send_package: { label: "Send Package", category: "delivery", description: "Ship packages of any size" },
  pickup_dropoff: { label: "Pickup & Drop-off", category: "delivery", description: "Pick up and deliver items" },
  car_wash: { label: "Car Wash", category: "car", description: "Professional car washing" },
  fueling: { label: "Fueling", category: "car", description: "Fuel delivery to your car" },
  oil_change: { label: "Oil Change", category: "car", description: "Quick oil change service" },
  vehicle_help: { label: "Vehicle Help", category: "car", description: "Roadside assistance" },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Pending" },
  accepted: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Accepted" },
  in_progress: { bg: "bg-orange-500/15", text: "text-orange-400", label: "In Progress" },
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Completed" },
  cancelled: { bg: "bg-red-500/15", text: "text-red-400", label: "Cancelled" },
};
