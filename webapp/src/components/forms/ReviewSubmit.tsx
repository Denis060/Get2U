import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, CheckCircle2, MapPin, Package, Car, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICE_LABELS: Record<string, string> = {
  send_mail: "Send Mail",
  send_package: "Send Package",
  pickup_dropoff: "Pickup & Drop-off",
  car_wash: "Car Wash",
  fueling: "Fueling",
  oil_change: "Oil Change",
  vehicle_help: "Vehicle Help",
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard (2–4 hrs)", color: "text-gray-600 bg-gray-100" },
  express: { label: "Express (1–2 hrs)", color: "text-orange-700 bg-orange-100" },
  urgent: { label: "Urgent (ASAP)", color: "text-red-700 bg-red-100" },
};

const DELIVERY_TYPES = new Set(["send_mail", "send_package", "pickup_dropoff"]);

export interface ReviewSubmitProps {
  serviceType: string;
  formData: Record<string, unknown>;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[hsl(24_95%_48%)]">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DeliveryReview({ data }: { data: Record<string, unknown> }) {
  const priority = String(data.priority ?? "standard");
  const priorityInfo = PRIORITY_LABELS[priority] ?? PRIORITY_LABELS.standard;
  return (
    <div className="space-y-3">
      <DetailRow icon={<MapPin className="h-4 w-4" />} label="Pickup Address" value={data.pickupAddress as string} />
      {data.pickupContactName ? (
        <DetailRow icon={<FileText className="h-4 w-4" />} label="Pickup Contact" value={`${data.pickupContactName}${data.pickupContactPhone ? ` · ${data.pickupContactPhone}` : ""}`} />
      ) : null}
      <DetailRow icon={<MapPin className="h-4 w-4" />} label="Drop-off Address" value={data.dropoffAddress as string} />
      {data.recipientName ? (
        <DetailRow icon={<FileText className="h-4 w-4" />} label="Recipient" value={`${data.recipientName}${data.recipientPhone ? ` · ${data.recipientPhone}` : ""}`} />
      ) : null}
      {data.packageType ? (
        <DetailRow icon={<Package className="h-4 w-4" />} label="Package Type" value={String(data.packageType).replace("_", " ")} />
      ) : null}
      {data.courierPreference ? (
        <DetailRow icon={<Package className="h-4 w-4" />} label="Courier" value={String(data.courierPreference).toUpperCase()} />
      ) : null}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-[hsl(24_95%_48%)]"><Clock className="h-4 w-4" /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Priority</p>
          <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-semibold", priorityInfo.color)}>{priorityInfo.label}</span>
        </div>
      </div>
      {data.notes ? <DetailRow icon={<FileText className="h-4 w-4" />} label="Notes" value={data.notes as string} /> : null}
    </div>
  );
}

function CarReview({ data }: { data: Record<string, unknown> }) {
  const priority = String(data.priority ?? "standard");
  const priorityInfo = PRIORITY_LABELS[priority] ?? PRIORITY_LABELS.standard;
  const issues = Array.isArray(data.issueTypes) ? (data.issueTypes as string[]).join(", ") : undefined;
  return (
    <div className="space-y-3">
      <DetailRow icon={<MapPin className="h-4 w-4" />} label="Car Location" value={data.carLocation as string} />
      {data.washType ? <DetailRow icon={<Car className="h-4 w-4" />} label="Wash Type" value={String(data.washType)} /> : null}
      {data.fuelType ? <DetailRow icon={<Car className="h-4 w-4" />} label="Fuel Type" value={String(data.fuelType)} /> : null}
      {data.oilType ? <DetailRow icon={<Car className="h-4 w-4" />} label="Oil Type" value={String(data.oilType).replace("_", " ")} /> : null}
      {issues ? <DetailRow icon={<Car className="h-4 w-4" />} label="Issues" value={issues} /> : null}
      {data.issueDescription ? <DetailRow icon={<FileText className="h-4 w-4" />} label="Issue Description" value={data.issueDescription as string} /> : null}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-[hsl(24_95%_48%)]"><Clock className="h-4 w-4" /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Priority</p>
          <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-semibold", priorityInfo.color)}>{priorityInfo.label}</span>
        </div>
      </div>
      {data.notes ? <DetailRow icon={<FileText className="h-4 w-4" />} label="Notes" value={data.notes as string} /> : null}
    </div>
  );
}

export default function ReviewSubmit({ serviceType, formData, onEdit, onSubmit, isSubmitting }: ReviewSubmitProps) {
  const isDelivery = DELIVERY_TYPES.has(serviceType);
  const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50"
        >
          {isDelivery ? (
            <Package className="h-8 w-8 text-[hsl(24_95%_48%)]" />
          ) : (
            <Car className="h-8 w-8 text-[hsl(24_95%_48%)]" />
          )}
        </motion.div>
        <h2 className="text-lg font-bold text-gray-900">{serviceLabel}</h2>
        <p className="text-sm text-gray-500">Review your request before confirming</p>
      </div>

      {/* Summary Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(24_95%_48%/0.3)] bg-white shadow-sm">
        {/* Pulsing border effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[hsl(24_95%_48%)]"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative p-5">
          {isDelivery ? (
            <DeliveryReview data={formData} />
          ) : (
            <CarReview data={formData} />
          )}
        </div>
      </div>

      {/* Pricing note */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          An agent will confirm the final price before starting your request.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isSubmitting}
          className="flex-1 rounded-2xl border-2 py-6"
        >
          <Edit2 className="mr-1.5 h-4 w-4" />
          Edit Details
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-2xl bg-[hsl(24_95%_48%)] hover:bg-[hsl(24_95%_40%)] py-6 text-base font-semibold text-white"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Confirm & Submit
        </Button>
      </div>
    </motion.div>
  );
}
