import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  MapPin,
  ChevronRight,
  Inbox,
  Loader2,
  Play,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import type { OrderResponse } from "@/types/orders";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FILTER_TABS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function MyJobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("active");
  const [completionDialogOrder, setCompletionDialogOrder] = useState<OrderResponse | null>(null);
  const [completionNote, setCompletionNote] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["agent-my-orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders?role=agent"),
  });

  const sorted = [...(orders ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filtered =
    activeFilter === "active"
      ? sorted.filter((o) => o.status === "accepted" || o.status === "in_progress")
      : sorted.filter((o) => o.status === "completed");

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status, completionNote }: { orderId: string; status: string; completionNote?: string }) =>
      api.patch<OrderResponse>(`/api/orders/${orderId}/status`, { status, completionNote }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["agent-my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["agent-available-orders"] });
      const label = vars.status === "in_progress" ? "started" : "completed";
      toast({ title: `Job ${label}!` });
      setCompletionDialogOrder(null);
      setCompletionNote("");
    },
    onError: () => {
      toast({ title: "Failed to update job", variant: "destructive" });
    },
  });

  const handleStartJob = (orderId: string) => {
    statusMutation.mutate({ orderId, status: "in_progress" });
  };

  const handleCompleteJob = () => {
    if (!completionDialogOrder) return;
    statusMutation.mutate({
      orderId: completionDialogOrder.id,
      status: "completed",
      completionNote: completionNote.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage jobs you have accepted
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeFilter === tab.key ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveFilter(tab.key)}
            className={
              activeFilter === tab.key
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : ""
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            {activeFilter === "active"
              ? "No active jobs"
              : "No completed jobs yet"}
          </p>
          {activeFilter === "active" ? (
            <Button
              size="sm"
              className="mt-4 bg-emerald-500 text-black hover:bg-emerald-400"
              onClick={() => navigate("/agent")}
            >
              Browse Available Jobs
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, idx) => {
            const Icon = getServiceIcon(order.serviceType);
            const iconColor = getServiceIconColor(order.serviceType);
            const location =
              order.pickupAddress ?? order.carLocation ?? "Location not specified";

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-border/40 bg-card p-4 transition-colors hover:border-emerald-500/20"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {getServiceLabel(order.serviceType)}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>

                    {order.customer ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Customer: {order.customer.name}
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                      <span className="truncate">{location}</span>
                    </div>
                    {order.dropoffAddress ? (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                        <span className="truncate">{order.dropoffAddress}</span>
                      </div>
                    ) : null}

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        View Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      {order.status === "accepted" ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartJob(order.id)}
                          disabled={statusMutation.isPending}
                          className="bg-emerald-500 text-black hover:bg-emerald-400"
                        >
                          {statusMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Start Job
                        </Button>
                      ) : order.status === "in_progress" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setCompletionDialogOrder(order);
                            setCompletionNote("");
                          }}
                          className="bg-amber-500 text-black hover:bg-amber-400"
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Complete Job
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completion dialog */}
      <Dialog
        open={completionDialogOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompletionDialogOrder(null);
            setCompletionNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Add an optional note about the completed job (e.g., where the package was left).
            </p>
            <div className="flex items-start gap-2">
              <MessageSquare className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <Textarea
                placeholder="Completion note (optional)..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setCompletionDialogOrder(null);
                setCompletionNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteJob}
              disabled={statusMutation.isPending}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {statusMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
