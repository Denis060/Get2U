import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import OrderChat from "@/components/OrderChat";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/types/orders";

type AdminOrder = {
  id: string;
  category: string;
  serviceType: string;
  status: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  carLocation: string | null;
  createdAt: string;
  estimatedPrice: number | null;
  customer: { id: string; name: string; email: string } | null;
  agent: { id: string; name: string; email: string } | null;
};

function OrderListItem({
  order,
  selected,
  onClick,
}: {
  order: AdminOrder;
  selected: boolean;
  onClick: () => void;
}) {
  const s = STATUS_COLORS[order.status] ?? STATUS_COLORS["pending"];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors",
        selected ? "bg-primary/5 border-l-2 border-l-primary" : ""
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{order.customer?.name ?? "Unknown"}</p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {order.serviceType.replace(/_/g, " ")}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        {new Date(order.createdAt).toLocaleDateString()}
      </p>
    </button>
  );
}

export default function AdminMessages() {
  const { data: session } = useSession();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders-messages"],
    queryFn: () => api.get<AdminOrder[]>("/api/admin/orders?limit=100"),
  });

  const currentUserId = session?.user?.id ?? "";
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    setMobileShowChat(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Messages</h2>
      <p className="text-sm text-muted-foreground">Monitor and join any order conversation.</p>

      <div className="flex h-[calc(100vh-220px)] min-h-[400px] rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
        {/* Order list — hidden on mobile when chat open */}
        <div
          className={cn(
            "w-full md:w-72 shrink-0 border-r border-border/40 flex flex-col",
            mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orders</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 border-b border-border/30">
                  <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted mb-1" />
                  <span className="inline-block h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onClick={() => handleSelect(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            !mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          {selectedOrder ? (
            <>
              <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-7 w-7"
                  onClick={() => setMobileShowChat(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-semibold text-sm">{selectedOrder.customer?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedOrder.serviceType.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <OrderChat orderId={selectedOrder.id} currentUserId={currentUserId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-sm">Select an order to view its conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
