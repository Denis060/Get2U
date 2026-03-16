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

  return (
    <div ref={containerRef} className="space-y-6 overflow-y-auto">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 ? (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <RefreshCw className={`h-5 w-5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
        </div>
      ) : null}

      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage your requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all min-h-[36px]",
              activeFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonOrderCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            {activeFilter === "all" ? "No orders yet" : `No ${activeFilter} orders`}
          </p>
          {activeFilter === "all" ? (
            <Button size="sm" className="mt-4" onClick={() => navigate("/new-request")}>
              Create Request
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
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
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="flex w-full items-center gap-4 rounded-xl border border-border/40 bg-card p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{getServiceLabel(order.serviceType)}</p>
                  {location ? (
                    <p className="truncate text-xs text-muted-foreground">{location}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {order.estimatedPrice != null ? (
                    <span className="text-xs font-medium text-foreground">${order.estimatedPrice.toFixed(2)}</span>
                  ) : null}
                  <StatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
