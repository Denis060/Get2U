import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
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
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders"),
  });

  const sorted = [...(orders ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const filtered = filterOrders(sorted, activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage your requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeFilter === tab.key ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveFilter(tab.key)}
            className="shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
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
