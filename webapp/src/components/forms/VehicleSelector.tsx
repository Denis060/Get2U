import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Car, Plus } from "lucide-react";
import type { VehicleResponse } from "@/types/orders";
import { cn } from "@/lib/utils";

const newVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
});

type NewVehicleData = z.infer<typeof newVehicleSchema>;

interface VehicleSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function VehicleSelector({ selectedId, onSelect }: VehicleSelectorProps) {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<VehicleResponse[]>("/api/vehicles"),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewVehicleData>({
    resolver: zodResolver(newVehicleSchema),
  });

  const addMutation = useMutation({
    mutationFn: (data: NewVehicleData) => api.post<VehicleResponse>("/api/vehicles", data),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onSelect(vehicle.id);
      setShowNew(false);
      reset();
    },
  });

  const list = vehicles ?? [];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {list.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => { onSelect(v.id); setShowNew(false); }}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all",
              selectedId === v.id
                ? "border-[hsl(24_95%_48%)] bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", selectedId === v.id ? "bg-[hsl(24_95%_48%)] text-white" : "bg-gray-100 text-gray-500")}>
              <Car className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{v.make} {v.model} {v.year ? `(${v.year})` : ""}</p>
              <p className="text-xs text-gray-400">{[v.color, v.plate].filter(Boolean).join(" · ") || "No details"}</p>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setShowNew((v) => !v); onSelect(""); }}
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 border-dashed px-3 py-2.5 text-left transition-all",
            showNew ? "border-[hsl(24_95%_48%)] bg-orange-50" : "border-gray-300 bg-white hover:border-gray-400"
          )}
        >
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", showNew ? "bg-[hsl(24_95%_48%)] text-white" : "bg-gray-100 text-gray-500")}>
            <Plus className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Add New Vehicle</p>
        </button>
      </div>

      {showNew ? (
        <div className="space-y-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(24_95%_48%)]">New Vehicle</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input placeholder="Make (Toyota)" {...register("make")} />
              {errors.make ? <p className="mt-0.5 text-xs text-red-500">{errors.make.message}</p> : null}
            </div>
            <div>
              <Input placeholder="Model (Camry)" {...register("model")} />
              {errors.model ? <p className="mt-0.5 text-xs text-red-500">{errors.model.message}</p> : null}
            </div>
            <Input placeholder="Year (2024)" {...register("year")} />
            <Input placeholder="Color (Black)" {...register("color")} />
            <div className="col-span-2">
              <Input placeholder="Plate (ABC-1234)" {...register("plate")} />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-[hsl(24_95%_48%)] hover:bg-[hsl(24_95%_40%)] text-white"
            onClick={handleSubmit((d) => addMutation.mutate(d))}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Save Vehicle
          </Button>
        </div>
      ) : null}
    </div>
  );
}
