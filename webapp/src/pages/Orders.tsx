import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ChevronRight, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import SkeletonOrderCard from "@/components/SkeletonOrderCard";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { OrderResponse } from "@/types/orders";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = new Set(["pending", "accepted", "in_progress"]);

function filterOrders(orders: OrderResponse[], filter: string): OrderResponse[] {
  if (filter === "all") return orders;
  if (filter === "active") return orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  return orders.filter((o) => o.status === filter);
}

export default function Orders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const isMobile = useIsMobile();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders"),
  });

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const sorted = [...(orders ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const filtered = filterOrders(sorted, activeFilter);

  const px = isMobile ? "px-4" : "";

  return (
    <div ref={containerRef} className="overflow-y-auto">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 ? (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <RefreshCw className={cn("h-5 w-5 text-primary", isRefreshing ? "animate-spin" : "")} />
        </div>
      ) : null}

      {/* Page header */}
      <div className={cn("pb-4 pt-4", px)}>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Track and manage your requests</p>
      </div>

      {/* Filter chips */}
      <div className={cn("mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none", isMobile ? "px-4" : "")}>
        {FILTER_TABS.map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
              activeFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className={cn("space-y-3", px)}>
          {[1, 2, 3, 4].map((i) => <SkeletonOrderCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-16 text-center", px)}>
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">
            {activeFilter === "all" ? "No orders yet" : `No ${activeFilter} orders`}
          </p>
          {activeFilter === "all" ? (
            <Button size="sm" className="mt-4 h-9 rounded-xl" onClick={() => navigate("/new-request")}>
              Create Request
            </Button>
          ) : null}
        </div>
      ) : (
        <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card", px)}>
          {filtered.map((order, idx) => {
            const Icon = getServiceIcon(order.serviceType);
            const iconColor = getServiceIconColor(order.serviceType);
            const location = order.pickupAddress ?? order.carLocation ?? "";

            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary",
                  idx < filtered.length - 1 ? "border-b border-border/30" : ""
                )}
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary", iconColor)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{getServiceLabel(order.serviceType)}</p>
                  {location ? (
                    <p className="truncate text-xs text-muted-foreground">{location}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {order.estimatedPrice != null ? (
                    <span className="text-xs font-bold text-foreground">${order.estimatedPrice.toFixed(2)}</span>
                  ) : null}
                  <StatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {isMobile && <div className="h-6" />}
    </div>
  );
}
