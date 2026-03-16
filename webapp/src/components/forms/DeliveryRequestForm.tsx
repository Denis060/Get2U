import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MapPin } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import { SectionCard, Field } from "./SectionCard";
import { PriorityCards, PackageCards } from "./FormCards";
import type { PriorityOption } from "./FormCards";

const schema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupContactName: z.string().optional(),
  pickupContactPhone: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTimePreference: z.string().optional(),
  dropoffAddress: z.string().min(1, "Drop-off address is required"),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  packageType: z.string().optional(),
  courierPreference: z.string().optional(),
  estimatedValue: z.string().optional(),
  fragile: z.boolean().optional(),
  priority: z.enum(["standard", "express", "urgent"]).default("standard"),
  notes: z.string().optional(),
});

export type DeliveryFormData = z.infer<typeof schema>;

interface DeliveryRequestFormProps {
  serviceType: string;
  onComplete: (data: DeliveryFormData) => void;
  initialData?: Partial<DeliveryFormData>;
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function DeliveryRequestForm({ serviceType, onComplete, initialData }: DeliveryRequestFormProps) {
  const showPackage = serviceType === "send_package" || serviceType === "send_mail";
  const [showMap, setShowMap] = useState(false);
  const [pickupAddr, setPickupAddr] = useState(initialData?.pickupAddress ?? "");
  const [dropoffAddr, setDropoffAddr] = useState(initialData?.dropoffAddress ?? "");

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<DeliveryFormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "standard", fragile: false, ...initialData },
  });

  const handlePickupChange = (address: string) => {
    setPickupAddr(address);
    setValue("pickupAddress", address, { shouldValidate: true });
  };

  const handleDropoffChange = (address: string) => {
    setDropoffAddr(address);
    setValue("dropoffAddress", address, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onComplete)}>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">

        {/* Section 1 — Pickup */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Pickup Details">
            <Field label="Pickup Address" error={errors.pickupAddress?.message}>
              <Input
                placeholder="Enter pickup address"
                value={pickupAddr}
                onChange={(e) => handlePickupChange(e.target.value)}
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
              <MapPicker
                pickupAddress={pickupAddr}
                dropoffAddress={dropoffAddr}
                onPickupChange={(address) => handlePickupChange(address)}
                onDropoffChange={(address) => handleDropoffChange(address)}
              />
            ) : null}
            <Field label="Contact Name" hint="Who should the agent ask for?">
              <Input placeholder="e.g. John Smith" {...register("pickupContactName")} />
            </Field>
            <Field label="Contact Phone">
              <Input type="tel" placeholder="+1 555 000 0000" {...register("pickupContactPhone")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup Date">
                <Input type="date" {...register("pickupDate")} />
              </Field>
              <Field label="Time Preference">
                <Controller name="pickupTimePreference" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Any time" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning 8–12</SelectItem>
                      <SelectItem value="afternoon">Afternoon 12–5</SelectItem>
                      <SelectItem value="evening">Evening 5–8</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Section 2 — Delivery */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Delivery Details">
            <Field label="Drop-off Address" error={errors.dropoffAddress?.message}>
              <Input
                placeholder="Enter drop-off address"
                value={dropoffAddr}
                onChange={(e) => handleDropoffChange(e.target.value)}
              />
            </Field>
            <Field label="Recipient Name">
              <Input placeholder="Recipient's full name" {...register("recipientName")} />
            </Field>
            <Field label="Recipient Phone">
              <Input type="tel" placeholder="+1 555 000 0000" {...register("recipientPhone")} />
            </Field>
          </SectionCard>
        </motion.div>

        {/* Section 3 — Package (conditional) */}
        {showPackage ? (
          <motion.div variants={fadeUp}>
            <SectionCard title="Package Details">
              <Field label="Package Type">
                <Controller name="packageType" control={control} render={({ field }) => (
                  <PackageCards value={(field.value ?? "") as "letter" | "small_package" | "large_package" | ""} onChange={(v) => field.onChange(v)} />
                )} />
              </Field>
              <Field label="Courier Preference">
                <Controller name="courierPreference" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                      <SelectItem value="local">Local Courier</SelectItem>
                      <SelectItem value="none">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">Fragile Item</p>
                  <p className="text-xs text-gray-400">Handle with extra care</p>
                </div>
                <Controller name="fragile" control={control} render={({ field }) => (
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                )} />
              </div>
              <Field label="Estimated Value (optional)" hint="Approximate value in $ / £">
                <Input type="number" placeholder="0.00" {...register("estimatedValue")} />
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
            <Textarea
              placeholder="e.g. please call before pickup, ring doorbell twice"
              rows={3}
              {...register("notes")}
            />
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
