import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import type { OrderResponse } from "@/types/orders";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Earnings() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["agent-my-orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders?role=agent"),
  });

  const completedJobs = orders?.filter((o) => o.status === "completed") ?? [];

  const totalEarnings = completedJobs.reduce(
    (sum, o) => sum + (o.finalPrice ?? o.estimatedPrice ?? 0),
    0
  );

  const averagePerJob =
    completedJobs.length > 0 ? totalEarnings / completedJobs.length : 0;

  const hasPricing = completedJobs.some(
    (o) => o.finalPrice != null || o.estimatedPrice != null
  );

  const stats = [
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Completed Jobs",
      value: completedJobs.length,
      icon: CheckCircle2,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Avg. Per Job",
      value: `$${averagePerJob.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your income from completed jobs
        </p>
      </div>

      {/* Stats cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${stat.bg}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <span className="text-xl font-bold md:text-2xl">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground md:text-xs">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Completed jobs list */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Completed Jobs</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
            <Receipt className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No completed jobs yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Complete your first job to start earning
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {completedJobs.map((order) => {
              const Icon = getServiceIcon(order.serviceType);
              const iconColor = getServiceIconColor(order.serviceType);
              const price = order.finalPrice ?? order.estimatedPrice;

              return (
                <motion.div
                  key={order.id}
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {getServiceLabel(order.serviceType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {price != null ? (
                      <span className="text-sm font-semibold text-emerald-400">
                        ${price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">
                        --
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {!hasPricing ? (
              <p className="pt-2 text-center text-xs text-muted-foreground/60">
                Pricing details coming soon
              </p>
            ) : null}
          </motion.div>
        )}
      </section>
    </div>
  );
}
