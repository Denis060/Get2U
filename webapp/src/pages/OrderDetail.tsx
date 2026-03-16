import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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

const PROGRESS_STEPS = ["pending", "accepted", "in_progress", "completed"];

function getStepIndex(status: string): number {
  const idx = PROGRESS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-3 w-24 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-32 rounded-xl skeleton-shimmer" />
        <div className="h-48 rounded-xl skeleton-shimmer" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/orders")}>
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{getServiceLabel(order.serviceType)}</h1>
          <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Progress tracker */}
      {!isCancelled ? (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Order Progress</h3>
          <div className="flex items-center justify-between">
            {PROGRESS_STEPS.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {idx > 0 ? (
                      <div className={`h-0.5 flex-1 ${idx <= currentStep ? "bg-primary" : "bg-border"}`} />
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < PROGRESS_STEPS.length - 1 ? (
                      <div className={`h-0.5 flex-1 ${idx < currentStep ? "bg-primary" : "bg-border"}`} />
                    ) : (
                      <div className="flex-1" />
                    )}
                  </div>
                  <p className={`mt-2 text-center text-[10px] capitalize ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {step.replace("_", " ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <p className="text-sm font-medium text-red-400">This order has been cancelled</p>
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Details</h3>

        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{getServiceLabel(order.serviceType)}</p>
            <p className="text-xs capitalize text-muted-foreground">{order.category} service</p>
          </div>
        </div>

        {order.pickupAddress ? (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pickup</p>
              <p className="text-sm">{order.pickupAddress}</p>
            </div>
          </div>
        ) : null}

        {order.dropoffAddress ? (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Drop-off</p>
              <p className="text-sm">{order.dropoffAddress}</p>
            </div>
          </div>
        ) : null}

        {order.carLocation ? (
          <div className="flex items-start gap-3">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Car Location</p>
              <p className="text-sm">{order.carLocation}</p>
            </div>
          </div>
        ) : null}

        {order.vehicle ? (
          <div className="flex items-start gap-3">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Vehicle</p>
              <p className="text-sm">
                {order.vehicle.make} {order.vehicle.model}
                {order.vehicle.year ? ` (${order.vehicle.year})` : ""}
                {order.vehicle.plate ? ` - ${order.vehicle.plate}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        {order.description ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <p className="mt-1 text-sm">{order.description}</p>
          </div>
        ) : null}

        {order.notes ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm">{order.notes}</p>
          </div>
        ) : null}

        {order.estimatedPrice != null ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Estimated Price</p>
            <p className="mt-1 text-lg font-bold text-primary">${order.estimatedPrice.toFixed(2)}</p>
          </div>
        ) : null}
      </div>

      {/* Agent info */}
      {order.agent ? (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Assigned Agent</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {order.agent.name?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-medium">{order.agent.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-amber-400" />
                <span>Agent</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" disabled={cancelMutation.isPending}>
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
      ) : null}

      {/* Chat section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Messages
        </h3>
        <OrderChat orderId={order.id} currentUserId={session?.user?.id ?? ""} />
      </div>
    </motion.div>
  );
}
