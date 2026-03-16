import { useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Briefcase,
  ClipboardCheck,
  DollarSign,
  MapPin,
  Clock,
  Inbox,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import { SERVICE_TYPES, type ServiceType } from "@/types/orders";
import type { OrderResponse } from "@/types/orders";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getCategoryLabel(serviceType: string): string {
  const info = SERVICE_TYPES[serviceType as ServiceType];
  if (!info) return "Other";
  return info.category === "car" ? "Car Service" : "Delivery";
}

function getCategoryColor(serviceType: string): string {
  const info = SERVICE_TYPES[serviceType as ServiceType];
  if (!info) return "bg-muted text-muted-foreground";
  return info.category === "car"
    ? "bg-purple-500/15 text-purple-400"
    : "bg-blue-500/15 text-blue-400";
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AgentDashboard() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Agent";

  // Fetch available (pending) orders
  const { data: availableOrders, isLoading: loadingAvailable } = useQuery({
    queryKey: ["agent-available-orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders?status=pending"),
    refetchInterval: 30000,
  });

  // Fetch agent's own orders
  const { data: myOrders } = useQuery({
    queryKey: ["agent-my-orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders?role=agent"),
  });

  const activeJobs = myOrders?.filter(
    (o) => o.status === "accepted" || o.status === "in_progress"
  ) ?? [];

  const completedJobs = myOrders?.filter((o) => o.status === "completed") ?? [];

  const totalEarnings = completedJobs.reduce(
    (sum, o) => sum + (o.finalPrice ?? o.estimatedPrice ?? 0),
    0
  );

  // Accept job mutation
  const acceptMutation = useMutation({
    mutationFn: (orderId: string) =>
      api.patch<OrderResponse>(`/api/orders/${orderId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["agent-my-orders"] });
      toast({ title: "Job accepted!", description: "You can now start working on this job." });
    },
    onError: () => {
      toast({
        title: "Failed to accept job",
        description: "This job may have already been taken.",
        variant: "destructive",
      });
    },
  });

  const pending = availableOrders ?? [];

  const stats = [
    {
      label: "Available Jobs",
      value: pending.length,
      icon: Briefcase,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "My Active Jobs",
      value: activeJobs.length,
      icon: ClipboardCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className={cn("flex items-center justify-between pb-2 pt-4", isMobile ? "px-4" : "")}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Agent Mode</p>
          <h1 className="text-2xl font-bold leading-tight">
            Welcome, <span className="text-emerald-400">{firstName}</span>
          </h1>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className={cn("grid grid-cols-3 gap-3", isMobile ? "px-4" : "")}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${stat.bg}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <span className="text-xl font-bold md:text-2xl">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground md:text-xs">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Available Jobs */}
      <section className={cn(isMobile ? "px-4" : "")}>
        <h2 className="mb-4 text-lg font-semibold">Available Jobs</h2>

        {loadingAvailable ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No available jobs right now
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              New jobs will appear here automatically
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {pending.map((order) => {
              const Icon = getServiceIcon(order.serviceType);
              const iconColor = getServiceIconColor(order.serviceType);
              const location =
                order.pickupAddress ?? order.carLocation ?? "Location not specified";
              const dropoff = order.dropoffAddress;

              return (
                <motion.div
                  key={order.id}
                  variants={fadeUp}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/agent/jobs/${order.id}`)}
                  className="cursor-pointer rounded-xl border border-border/40 bg-card p-4 transition-colors hover:border-emerald-500/30 active:bg-card/80"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary ${iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {getServiceLabel(order.serviceType)}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getCategoryColor(order.serviceType)}`}
                        >
                          {getCategoryLabel(order.serviceType)}
                        </span>
                      </div>

                      {order.customer ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.customer.name}
                        </p>
                      ) : null}

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                          <span className="truncate">{location}</span>
                        </div>
                        {dropoff ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                            <span className="truncate">{dropoff}</span>
                          </div>
                        ) : null}
                      </div>

                      {order.description ? (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground/80">
                          {order.description}
                        </p>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {timeAgo(order.createdAt)}
                          </div>
                          {order.estimatedPrice != null ? (
                            <span className="text-xs font-semibold text-emerald-400">
                              ${order.estimatedPrice.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptMutation.mutate(order.id);
                          }}
                          disabled={acceptMutation.isPending}
                          className="bg-amber-500 text-black hover:bg-amber-400"
                        >
                          {acceptMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Accept Job
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}
