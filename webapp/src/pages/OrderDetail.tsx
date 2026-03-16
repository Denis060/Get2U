import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Car,
  User,
  Star,
  Clock,
  Loader2,
  MessageCircle,
} from "lucide-react";
import OrderChat from "@/components/OrderChat";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { OrderResponse } from "@/types/orders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PROGRESS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function getStepIndex(status: string): number {
  const idx = PROGRESS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<OrderResponse>(`/api/orders/${id}`),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/api/orders/${id}/status`, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const px = isMobile ? "px-4" : "";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className={cn("flex items-center gap-3 py-4", px)}>
          <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
          </div>
        </div>
        <div className={cn("h-28 rounded-2xl bg-secondary animate-pulse", px)} />
        <div className={cn("h-48 rounded-2xl bg-secondary animate-pulse", px)} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="ghost" className="mt-4 rounded-xl" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const Icon = getServiceIcon(order.serviceType);
  const iconColor = getServiceIconColor(order.serviceType);
  const currentStep = getStepIndex(order.status === "cancelled" ? "pending" : order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-0 pb-6"
    >
      {/* Native back navigation header */}
      <div className={cn("flex items-center gap-2 py-3", px)}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/orders")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-base font-bold">{getServiceLabel(order.serviceType)}</h1>
          <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Progress tracker */}
      {!isCancelled ? (
        <div className={cn("mb-4 mt-2", px)}>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Order Progress
            </p>
            <div className="flex items-center justify-between">
              {PROGRESS_STEPS.map((s, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={s.key} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {idx > 0 ? (
                        <div className={cn("h-0.5 flex-1 transition-colors", idx <= currentStep ? "bg-primary" : "bg-border")} />
                      ) : (
                        <div className="flex-1" />
                      )}
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {idx + 1}
                      </div>
                      {idx < PROGRESS_STEPS.length - 1 ? (
                        <div className={cn("h-0.5 flex-1 transition-colors", idx < currentStep ? "bg-primary" : "bg-border")} />
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                    <p className={cn("mt-1.5 text-center text-[9px] font-semibold uppercase tracking-wide", isActive ? "text-primary" : "text-muted-foreground")}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn("mb-4 mt-2", px)}>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-sm font-semibold text-destructive">This order has been cancelled</p>
          </div>
        </div>
      )}

      {/* Service + details */}
      <div className={cn("mb-4", px)}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</p>
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card divide-y divide-border/30">
          {/* Service row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{getServiceLabel(order.serviceType)}</p>
              <p className="text-xs capitalize text-muted-foreground">{order.category} service</p>
            </div>
          </div>

          {order.pickupAddress ? (
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-emerald-400" />}
              label="Pickup"
              value={order.pickupAddress}
            />
          ) : null}

          {order.dropoffAddress ? (
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-amber-400" />}
              label="Drop-off"
              value={order.dropoffAddress}
            />
          ) : null}

          {order.carLocation ? (
            <DetailRow
              icon={<Car className="h-4 w-4 text-blue-400" />}
              label="Car Location"
              value={order.carLocation}
            />
          ) : null}

          {order.vehicle ? (
            <DetailRow
              icon={<Car className="h-4 w-4 text-purple-400" />}
              label="Vehicle"
              value={`${order.vehicle.make} ${order.vehicle.model}${order.vehicle.year ? ` (${order.vehicle.year})` : ""}${order.vehicle.plate ? ` · ${order.vehicle.plate}` : ""}`}
            />
          ) : null}

          {order.description ? (
            <div className="px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="mt-0.5 text-sm text-foreground">{order.description}</p>
            </div>
          ) : null}

          {order.notes ? (
            <div className="px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              <p className="mt-0.5 text-sm text-foreground">{order.notes}</p>
            </div>
          ) : null}

          {order.estimatedPrice != null ? (
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Price</p>
              <p className="text-lg font-bold text-primary">${order.estimatedPrice.toFixed(2)}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Agent info */}
      {order.agent ? (
        <div className={cn("mb-4", px)}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assigned Agent</p>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {order.agent.name?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{order.agent.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-amber-400" />
                  <span>Verified Agent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Timestamps */}
      <div className={cn("mb-4 flex items-center gap-4 text-xs text-muted-foreground", px)}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created {new Date(order.createdAt).toLocaleString()}
        </div>
        {order.updatedAt !== order.createdAt ? (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {new Date(order.updatedAt).toLocaleString()}
          </div>
        ) : null}
      </div>

      {/* Cancel button */}
      {order.status === "pending" ? (
        <div className={cn("mb-4", px)}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-12 w-full rounded-xl" disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The order will be marked as cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cancelMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}

      {/* Chat section */}
      <div className={cn("", px)}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Messages</p>
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Order Chat</p>
          </div>
          <OrderChat orderId={order.id} currentUserId={session?.user?.id ?? ""} />
        </div>
      </div>

      <div className="h-4" />
    </motion.div>
  );
}
