import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { OrderResponse } from "@/types/orders";

const deliverySchema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Drop-off address is required"),
  packageType: z.string().optional(),
  courierService: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

interface DeliveryFormProps {
  serviceType: string;
}

export default function DeliveryForm({ serviceType }: DeliveryFormProps) {
  const navigate = useNavigate();
  const showPackageType = serviceType === "send_package";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
  });

  const mutation = useMutation({
    mutationFn: (data: DeliveryFormData) =>
      api.post<OrderResponse>("/api/orders", {
        serviceType,
        category: "delivery",
        ...data,
      }),
    onSuccess: (order) => {
      navigate(`/orders/${order.id}`);
    },
  });

  const onSubmit = (data: DeliveryFormData) => mutation.mutate(data);

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-border/50 bg-card p-5"
    >
      <h3 className="text-sm font-semibold text-primary">Order Details</h3>

      <div className="space-y-2">
        <Label htmlFor="pickupAddress">Pickup Address</Label>
        <Input id="pickupAddress" placeholder="Enter pickup address" {...register("pickupAddress")} />
        {errors.pickupAddress ? <p className="text-xs text-destructive">{errors.pickupAddress.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dropoffAddress">Drop-off Address</Label>
        <Input id="dropoffAddress" placeholder="Enter drop-off address" {...register("dropoffAddress")} />
        {errors.dropoffAddress ? <p className="text-xs text-destructive">{errors.dropoffAddress.message}</p> : null}
      </div>

      {showPackageType ? (
        <div className="space-y-2">
          <Label>Package Type</Label>
          <Select onValueChange={(v) => setValue("packageType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select package type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="small_package">Small Package</SelectItem>
              <SelectItem value="large_package">Large Package</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Courier Service (Optional)</Label>
        <Select onValueChange={(v) => setValue("courierService", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select courier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
            <SelectItem value="usps">USPS</SelectItem>
            <SelectItem value="local">Local Courier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" placeholder="Describe your request..." {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" placeholder="Any special instructions..." {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Request
      </Button>

      {mutation.isError ? (
        <p className="text-center text-xs text-destructive">
          {(mutation.error as Error).message ?? "Failed to create order"}
        </p>
      ) : null}
    </motion.form>
  );
}
