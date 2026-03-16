import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import OrderChat from "@/components/OrderChat";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/types/orders";

type OrderSummary = {
  id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  agent?: { id: string; name: string; email: string; image: string | null } | null;
};

const ACTIVE_STATUSES = ["pending", "accepted", "in_progress"];

export default function FloatingChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const currentUserId = session?.user?.id ?? "";

  const { data: allOrders = [] } = useQuery({
    queryKey: ["orders", "floating"],
    queryFn: () => api.get<OrderSummary[]>("/api/orders"),
    enabled: !!session?.user,
    refetchInterval: 30000,
  });

  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const selectedOrder = activeOrders.find((o) => o.id === selectedOrderId);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) setSelectedOrderId(null);
  };

  if (!session?.user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle messages"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        {activeOrders.length > 0 && !isOpen ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {activeOrders.length}
          </span>
        ) : null}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed z-50 rounded-2xl border border-border/60 bg-white shadow-2xl flex flex-col overflow-hidden",
              "bottom-36 right-4",
              "w-80 h-96",
              "max-sm:bottom-20 max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:rounded-b-none max-sm:h-[60vh]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-white">
              {selectedOrderId ? (
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <span className="text-sm font-semibold text-foreground">Messages</span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {selectedOrder ? (
                <div className="p-3 h-full flex flex-col">
                  <OrderChat orderId={selectedOrder.id} currentUserId={currentUserId} />
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-6 text-center">
                  <MessageSquare className="h-10 w-10 opacity-30" />
                  <p className="text-sm">No active orders with messages.</p>
                  <p className="text-xs opacity-70">Active orders will appear here for you to chat.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {activeOrders.map((order) => {
                    const s = STATUS_COLORS[order.status] ?? STATUS_COLORS["pending"];
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium capitalize truncate">
                              {order.serviceType.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.agent?.name ? `Agent: ${order.agent.name}` : "Awaiting agent"}
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
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
