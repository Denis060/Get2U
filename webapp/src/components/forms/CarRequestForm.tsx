import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MapPin } from "lucide-react";
import SingleLocationMap from "@/components/SingleLocationMap";
import { SectionCard, Field } from "./SectionCard";
import { PriorityCards } from "./FormCards";
import { RadioCards, IssueChecks } from "./CarFormCards";
import { VehicleSelector } from "./VehicleSelector";
import type { PriorityOption } from "./FormCards";

const schema = z.object({
  carLocation: z.string().min(1, "Car location is required"),
  vehicleId: z.string().optional(),
  washType: z.string().optional(),
  fuelType: z.string().optional(),
  tankLevel: z.string().optional(),
  currentMileage: z.string().optional(),
  oilType: z.string().optional(),
  issueTypes: z.array(z.string()).optional(),
  issueDescription: z.string().optional(),
  priority: z.enum(["standard", "express", "urgent"]).default("standard"),
  notes: z.string().optional(),
});

export type CarFormData = z.infer<typeof schema>;

interface CarRequestFormProps {
  serviceType: string;
  onComplete: (data: CarFormData) => void;
  initialData?: Partial<CarFormData>;
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const WASH_TYPES = [
  { value: "basic", label: "Basic Wash", sub: "Exterior only" },
  { value: "full", label: "Full Clean", sub: "Int. & Ext." },
  { value: "premium", label: "Premium Detail", sub: "Deep detail" },
];

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol / Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric Top-up" },
];

const OIL_TYPES = [
  { value: "synthetic", label: "Synthetic" },
  { value: "semi_synthetic", label: "Semi-Synthetic" },
  { value: "conventional", label: "Conventional" },
  { value: "not_sure", label: "Not Sure" },
];

export default function CarRequestForm({ serviceType, onComplete, initialData }: CarRequestFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [locationAddr, setLocationAddr] = useState(initialData?.carLocation ?? "");
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialData?.vehicleId ?? "");

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "standard", issueTypes: [], ...initialData },
  });

  const handleLocationChange = (address: string) => {
    setLocationAddr(address);
    setValue("carLocation", address, { shouldValidate: true });
  };

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
    setValue("vehicleId", id || undefined);
  };

  const handleSingleMapChange = (address: string, lat: number, lng: number) => {
    handleLocationChange(address);
    void lat; void lng;
  };

  return (
    <form onSubmit={handleSubmit(onComplete)}>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">

        {/* Section 1 — Car Location */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Car Location">
            <Field label="Address" error={errors.carLocation?.message}>
              <Input
                placeholder="Enter your car's location"
                value={locationAddr}
                onChange={(e) => handleLocationChange(e.target.value)}
              />
            </Field>
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-[hsl(24_95%_48%)] hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              {showMap ? "Hide map" : "Set on map"}
            </button>
            {showMap ? (
              <SingleLocationMap address={locationAddr} onLocationChange={handleSingleMapChange} />
            ) : null}
          </SectionCard>
        </motion.div>

        {/* Section 2 — Vehicle */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Vehicle">
            <VehicleSelector selectedId={selectedVehicleId} onSelect={handleVehicleSelect} />
          </SectionCard>
        </motion.div>

        {/* Section 3 — Service-Specific */}
        {serviceType === "car_wash" ? (
          <motion.div variants={fadeUp}>
            <SectionCard title="Wash Type">
              <Controller name="washType" control={control} render={({ field }) => (
                <RadioCards options={WASH_TYPES} value={field.value ?? ""} onChange={field.onChange} />
              )} />
            </SectionCard>
          </motion.div>
        ) : serviceType === "fueling" ? (
          <motion.div variants={fadeUp}>
            <SectionCard title="Fuel Details">
              <Field label="Fuel Type">
                <Controller name="fuelType" control={control} render={({ field }) => (
                  <RadioCards options={FUEL_TYPES} value={field.value ?? ""} onChange={field.onChange} />
                )} />
              </Field>
              <Field label="Approximate Tank Level">
                <Controller name="tankLevel" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">Empty</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="half">Half</SelectItem>
                      <SelectItem value="three_quarter">Three-quarter</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            </SectionCard>
          </motion.div>
        ) : serviceType === "oil_change" ? (
          <motion.div variants={fadeUp}>
            <SectionCard title="Oil Change Details">
              <Field label="Current Mileage (optional)">
                <Input type="number" placeholder="e.g. 45000" {...register("currentMileage")} />
              </Field>
              <Field label="Oil Type Preference">
                <Controller name="oilType" control={control} render={({ field }) => (
                  <RadioCards options={OIL_TYPES} value={field.value ?? ""} onChange={field.onChange} />
                )} />
              </Field>
            </SectionCard>
          </motion.div>
        ) : serviceType === "vehicle_help" ? (
          <motion.div variants={fadeUp}>
            <SectionCard title="Issue Details">
              <Field label="Issue Type">
                <Controller name="issueTypes" control={control} render={({ field }) => (
                  <IssueChecks value={field.value ?? []} onChange={field.onChange} />
                )} />
              </Field>
              <Field label="Describe the Issue">
                <Textarea placeholder="Describe what's happening with your vehicle..." rows={3} {...register("issueDescription")} />
              </Field>
            </SectionCard>
          </motion.div>
        ) : null}

        {/* Section 4 — Priority */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Request Priority">
            <Controller name="priority" control={control} render={({ field }) => (
              <PriorityCards value={field.value as PriorityOption} onChange={(v) => field.onChange(v)} />
            )} />
          </SectionCard>
        </motion.div>

        {/* Section 5 — Notes */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Special Instructions">
            <Textarea placeholder="Any additional notes for the agent..." rows={3} {...register("notes")} />
          </SectionCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button type="submit" className="w-full bg-[hsl(24_95%_48%)] hover:bg-[hsl(24_95%_40%)] text-white py-6 text-base font-semibold rounded-2xl">
            Next: Review <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>

      </motion.div>
    </form>
  );
}
