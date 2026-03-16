import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { OrderResponse, VehicleResponse } from "@/types/orders";

const carSchema = z.object({
  carLocation: z.string().min(1, "Car location is required"),
  vehicleId: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const newVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;
type NewVehicleData = z.infer<typeof newVehicleSchema>;

interface CarServiceFormProps {
  serviceType: string;
}

export default function CarServiceForm({ serviceType }: CarServiceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewVehicle, setShowNewVehicle] = useState(false);

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<VehicleResponse[]>("/api/vehicles"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
  });

  const {
    register: registerVehicle,
    handleSubmit: handleVehicleSubmit,
    reset: resetVehicle,
    formState: { errors: vehicleErrors },
  } = useForm<NewVehicleData>({
    resolver: zodResolver(newVehicleSchema),
  });

  const addVehicleMutation = useMutation({
    mutationFn: (data: NewVehicleData) => api.post<VehicleResponse>("/api/vehicles", data),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setValue("vehicleId", vehicle.id);
      setShowNewVehicle(false);
      resetVehicle();
    },
  });

  const orderMutation = useMutation({
    mutationFn: (data: CarFormData) =>
      api.post<OrderResponse>("/api/orders", {
        serviceType,
        category: "car",
        ...data,
      }),
    onSuccess: (order) => {
      navigate(`/orders/${order.id}`);
    },
  });

  const onSubmit = (data: CarFormData) => orderMutation.mutate(data);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 rounded-xl border border-border/50 bg-card p-5"
    >
      <h3 className="text-sm font-semibold text-primary">Order Details</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="carLocation">Car Location</Label>
          <Input id="carLocation" placeholder="Where is your vehicle?" {...register("carLocation")} />
          {errors.carLocation ? <p className="text-xs text-destructive">{errors.carLocation.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Vehicle</Label>
          <Select
            onValueChange={(v) => {
              if (v === "new") {
                setShowNewVehicle(true);
                setValue("vehicleId", undefined);
              } else {
                setShowNewVehicle(false);
                setValue("vehicleId", v);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {(vehicles ?? []).map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.make} {v.model} {v.year ? `(${v.year})` : ""} {v.plate ? `- ${v.plate}` : ""}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <span className="flex items-center gap-1">
                  <PlusCircle className="h-3 w-3" /> Add New Vehicle
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showNewVehicle ? (
          <div className="space-y-3 rounded-lg border border-dashed border-border/60 bg-secondary/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">New Vehicle</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="make" className="text-xs">Make</Label>
                <Input id="make" placeholder="Toyota" {...registerVehicle("make")} />
                {vehicleErrors.make ? <p className="text-xs text-destructive">{vehicleErrors.make.message}</p> : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="model" className="text-xs">Model</Label>
                <Input id="model" placeholder="Camry" {...registerVehicle("model")} />
                {vehicleErrors.model ? <p className="text-xs text-destructive">{vehicleErrors.model.message}</p> : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="year" className="text-xs">Year</Label>
                <Input id="year" placeholder="2024" {...registerVehicle("year")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="color" className="text-xs">Color</Label>
                <Input id="color" placeholder="Black" {...registerVehicle("color")} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="plate" className="text-xs">Plate Number</Label>
                <Input id="plate" placeholder="ABC-1234" {...registerVehicle("plate")} />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleVehicleSubmit((d) => addVehicleMutation.mutate(d))}
              disabled={addVehicleMutation.isPending}
            >
              {addVehicleMutation.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Save Vehicle
            </Button>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea id="description" placeholder="Describe your request..." {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" placeholder="Any special instructions..." {...register("notes")} />
        </div>

        <Button type="submit" className="w-full" disabled={orderMutation.isPending}>
          {orderMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Request
        </Button>

        {orderMutation.isError ? (
          <p className="text-center text-xs text-destructive">
            {(orderMutation.error as Error).message ?? "Failed to create order"}
          </p>
        ) : null}
      </form>
    </motion.div>
  );
}
