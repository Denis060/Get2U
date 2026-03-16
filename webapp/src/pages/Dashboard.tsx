import { useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Package, Truck, Car, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import SkeletonOrderCard from "@/components/SkeletonOrderCard";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import type { OrderResponse } from "@/types/orders";

const QUICK_ACTIONS = [
  { type: "send_mail", label: "Send Mail", desc: "Letters & documents", priceHint: "From $99.99/mo", icon: Mail, color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  { type: "send_package", label: "Send Package", desc: "Any size package", priceHint: "From $99.99/mo", icon: Package, color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  { type: "pickup_dropoff", label: "Pickup & Drop-off", desc: "Pick up & deliver", priceHint: "$5 + courier fee", icon: Truck, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  { type: "car_wash", label: "Car Services", desc: "Wash, fuel & more", priceHint: "From $89.99/mo", icon: Car, color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders"),
  });

  const recentOrders = orders?.slice(0, 5) ?? [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Hello, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">What do you need?</h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.type}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/new-request?type=${action.type}`)}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-5 text-center transition-colors hover:border-primary/30 hover:bg-secondary"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.desc}</p>
                <p className="mt-1 text-xs font-medium text-primary/80">{action.priceHint}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")} className="text-primary hover:text-primary">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonOrderCard key={i} />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-12 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Create your first errand request to get started</p>
            <Button size="sm" className="mt-4" onClick={() => navigate("/new-request")}>
              New Request
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const Icon = getServiceIcon(order.serviceType);
              const iconColor = getServiceIconColor(order.serviceType);
              return (
                <motion.button
                  key={order.id}
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
