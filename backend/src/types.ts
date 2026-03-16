import { z } from "zod";

export const ServiceCategory = z.enum(["delivery", "car_service"]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const DeliveryServiceType = z.enum(["send_mail", "send_package", "pickup_dropoff"]);
export const CarServiceType = z.enum(["car_wash", "fueling", "oil_change", "vehicle_help"]);
export const ServiceType = z.enum([
  "send_mail",
  "send_package",
  "pickup_dropoff",
  "car_wash",
  "fueling",
  "oil_change",
  "vehicle_help",
]);
export type ServiceType = z.infer<typeof ServiceType>;

export const PackageType = z.enum(["letter", "small_package", "large_package"]);
export const CourierService = z.enum(["dhl", "fedex", "ups", "usps", "local"]);
export const OrderStatus = z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const UserRole = z.enum(["customer", "agent", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

// Create order schemas
export const CreateDeliveryOrderSchema = z.object({
  category: z.literal("delivery"),
  serviceType: DeliveryServiceType,
  pickupAddress: z.string().min(1),
  dropoffAddress: z.string().min(1),
  packageType: PackageType.optional(),
  courierService: CourierService.optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateCarServiceOrderSchema = z.object({
  category: z.literal("car_service"),
  serviceType: CarServiceType,
  vehicleId: z.string().optional(),
  carLocation: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.discriminatedUnion("category", [
  CreateDeliveryOrderSchema,
  CreateCarServiceOrderSchema,
]);
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatus,
  completionNote: z.string().optional(),
});

export const UpdateUserRoleSchema = z.object({
  role: UserRole,
});

export const CreateVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.string().optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
  location: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Response types
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
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email: string; image: string | null };
  agent?: { id: string; name: string; email: string; image: string | null } | null;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: string | null;
    color: string | null;
    plate: string | null;
  } | null;
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

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type MessageResponse = {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; email: string; image: string | null; role: string };
};
