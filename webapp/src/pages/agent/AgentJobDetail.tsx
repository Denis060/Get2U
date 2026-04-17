import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  User,
  Car,
  FileText,
  Clock,
  DollarSign,
  CheckCircle2,
  Play,
  Loader2,
  MessageSquare,
  Package,
  Briefcase,
  Camera,
} from "lucide-react";
import InspectionUpload from "@/components/InspectionUpload";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getServiceIcon, getServiceLabel } from "@/lib/service-helpers";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import LocationSharing from "@/components/LocationSharing";
import type { OrderResponse } from "@/types/orders";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const STEPS = ["Pending", "Accepted", "In Progress", "Completed"];
const STATUS_STEP: Record<string, number> = {
  pending: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="mx-4 overflow-hidden rounded-2xl border border-border/40 bg-card">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  iconClass = "text-muted-foreground",
  last = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  iconClass?: string;
  last?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={cn("flex items-start gap-3 px-4 py-3.5", !last && "border-b border-border/30")}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function AgentJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNote, setCompletionNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<OrderResponse>(`/api/orders/${id}`),
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.patch<OrderResponse>(`/api/orders/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["agent-available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["agent-my-orders"] });
      toast({ title: "Job accepted!", description: "Head to the pickup location." });
    },
    onError: () => toast({ title: "Could not accept job", variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, completionNote }: { status: string; completionNote?: string }) =>
      api.patch<OrderResponse>(`/api/orders/${id}/status`, { status, completionNote }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["agent-my-orders"] });
      const label = vars.status === "in_progress" ? "Job started!" : "Job completed!";
      toast({ title: label });
      setShowCompleteDialog(false);
      setCompletionNote("");
    },
    onError: () => toast({ title: "Failed to update job", variant: "destructive" }),
  });

  const inspectionMutation = useMutation({
    mutationFn: (values: { type: string; photos: string[]; notes?: string }) =>
      api.post(`/api/orders/${id}/inspections`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({ title: "Inspection documented!" });
    },
    onError: () => toast({ title: "Failed to save inspection", variant: "destructive" }),
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl animate-pulse bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded animate-pulse bg-secondary" />
            <div className="h-3 w-24 rounded animate-pulse bg-secondary" />
          </div>
        </div>
        <div className="h-28 rounded-2xl animate-pulse bg-secondary" />
        <div className="h-40 rounded-2xl animate-pulse bg-secondary" />
        <div className="h-32 rounded-2xl animate-pulse bg-secondary" />
      </div>
    );
  }

  const Icon = getServiceIcon(order.serviceType);
  const currentStep = STATUS_STEP[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";
  const isPending = order.status === "pending";
  const isAccepted = order.status === "accepted";
  const isInProgress = order.status === "in_progress";
  const isCompleted = order.status === "completed";

  const vehicleLabel = order.vehicle
    ? [order.vehicle.color, order.vehicle.make, order.vehicle.model, order.vehicle.plate ? `(${order.vehicle.plate})` : null]
        .filter(Boolean).join(" ")
    : null;

  const pickupInspection = order.inspections?.find(i => i.type === "pickup");
  const dropoffInspection = order.inspections?.find(i => i.type === "dropoff");

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className={cn("pb-8", isMobile ? "" : "space-y-6")}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight">{getServiceLabel(order.serviceType)}</h1>
          <p className="text-xs text-muted-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {!isCancelled && (
        <div className="mx-4 mb-5 overflow-hidden rounded-2xl border border-border/40 bg-card">
          <LiveTrackingMap
            pickupAddress={order.pickupAddress}
            dropoffAddress={order.dropoffAddress}
            carLocation={order.carLocation}
            agentLat={order.agentLat}
            agentLng={order.agentLng}
          />
        </div>
      )}

      {/* Sharing controls for active jobs */}
      {(isAccepted || isInProgress) && (
        <div className="px-4">
          <LocationSharing orderId={order.id} isActive={isAccepted || isInProgress} />
        </div>
      )}

      <div className="space-y-5">
        {/* Progress Tracker */}
        {!isCancelled && (
          <DetailSection title="Progress">
            <div className="px-4 py-5">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-border/60" />
                <div
                  className="absolute left-0 top-4 h-0.5 bg-emerald-400 transition-all duration-500"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  return (
                    <div key={step} className="relative flex flex-col items-center gap-2">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                        done
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-border bg-background text-muted-foreground"
                      )}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <span className={cn("text-[10px] font-semibold", done ? "text-emerald-400" : "text-muted-foreground")}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </DetailSection>
        )}

        {/* Customer Info */}
        {order.customer && (
          <DetailSection title="Customer">
            <DetailRow icon={User} label="Name" value={order.customer.name} iconClass="text-blue-400" last />
          </DetailSection>
        )}

        {/* Documentation / Inspections */}
        {(pickupInspection || dropoffInspection) && (
          <DetailSection title="Condition Documentation">
            {pickupInspection && (
              <div className="border-b border-border/30 px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="h-4 w-4 text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Pickup Inspection</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {pickupInspection.photos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted">
                      <img src={url} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                {pickupInspection.notes && (
                  <p className="text-xs text-muted-foreground italic">"{pickupInspection.notes}"</p>
                )}
              </div>
            )}
            {dropoffInspection && (
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Drop-off Inspection</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {dropoffInspection.photos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted">
                      <img src={url} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                {dropoffInspection.notes && (
                  <p className="text-xs text-muted-foreground italic">"{dropoffInspection.notes}"</p>
                )}
              </div>
            )}
          </DetailSection>
        )}

        {/* Service & Location */}
        <DetailSection title="Service Details">
          <DetailRow icon={Package} label="Service Type" value={getServiceLabel(order.serviceType)} iconClass="text-primary" />
          <DetailRow icon={MapPin} label="Pickup / Location" value={order.pickupAddress ?? order.carLocation ?? null} iconClass="text-emerald-400" />
          <DetailRow icon={MapPin} label="Dropoff" value={order.dropoffAddress ?? null} iconClass="text-amber-400" />
          <DetailRow icon={FileText} label="Description" value={order.description ?? null} iconClass="text-muted-foreground" />
          <DetailRow icon={FileText} label="Notes" value={order.notes ?? null} iconClass="text-muted-foreground" last={!order.details || Object.keys(order.details).length === 0} />
          
          {order.details && Object.keys(order.details).length > 0 ? (
            <div className="px-4 py-3.5 border-t border-border/30">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Service Requirements</p>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {Object.entries(order.details).map(([key, value]) => {
                  if (value === undefined || value === null || value === "") return null;
                  const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={key}>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{formattedKey}</span>
                      <p className="text-sm font-medium text-foreground">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </DetailSection>

        {/* Vehicle (if car service) */}
        {vehicleLabel ? (
          <DetailSection title="Vehicle">
            <DetailRow icon={Car} label="Vehicle" value={vehicleLabel} iconClass="text-purple-400" last />
          </DetailSection>
        ) : null}

        {/* Completion note */}
        {order.completionNote ? (
          <DetailSection title="Completion Note">
            <DetailRow icon={MessageSquare} label="Agent Note" value={order.completionNote} iconClass="text-emerald-400" last />
          </DetailSection>
        ) : null}

        {/* Pricing & Time */}
        <DetailSection title="Job Info">
          <DetailRow
            icon={DollarSign}
            label="Estimated Price"
            value={order.estimatedPrice != null ? `$${order.estimatedPrice.toFixed(2)}` : "Not set"}
            iconClass="text-primary"
          />
          {order.finalPrice != null ? (
            <DetailRow icon={DollarSign} label="Final Price" value={`$${order.finalPrice.toFixed(2)}`} iconClass="text-emerald-400" />
          ) : null}
          <DetailRow icon={Clock} label="Submitted" value={formattedDate} iconClass="text-muted-foreground" last />
        </DetailSection>

        {/* Action Button */}
        {isPending && (
          <div className="px-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {acceptMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Briefcase className="h-5 w-5" />}
              Accept This Job
            </motion.button>
          </div>
        )}

        {isAccepted && (
          <div className="px-4 space-y-4">
            {!pickupInspection ? (
              <InspectionUpload 
                type="pickup" 
                onComplete={(photos, notes) => inspectionMutation.mutate({ type: "pickup", photos, notes })} 
                isLoading={inspectionMutation.isPending}
              />
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => statusMutation.mutate({ status: "in_progress" })}
                disabled={statusMutation.isPending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
              >
                {statusMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                Pickup Complete: Start Job
              </motion.button>
            )}
          </div>
        )}

        {isInProgress && (
          <div className="px-4 space-y-4">
            {!dropoffInspection ? (
              <InspectionUpload 
                type="dropoff" 
                onComplete={(photos, notes) => inspectionMutation.mutate({ type: "dropoff", photos, notes })} 
                isLoading={inspectionMutation.isPending}
              />
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCompleteDialog(true)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-sm font-bold text-black shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="h-5 w-5" />
                Drop-off Complete: Mark Complete
              </motion.button>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="mx-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 py-4 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            Job Completed
          </div>
        )}
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Add an optional completion note (e.g. where the package was left).
            </p>
            <Textarea
              placeholder="Completion note (optional)..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ status: "completed", completionNote: completionNote.trim() || undefined })}
              disabled={statusMutation.isPending}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {statusMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
