import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Users, UserCheck, Package, Clock, Truck, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS } from "@/types/orders";

type AdminStats = {
  totalCustomers: number;
  totalAgents: number;
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalMessages: number;
};

type RecentOrder = {
  id: string;
  category: string;
  serviceType: string;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; email: string } | null;
};

const STAT_CARDS = [
  { key: "totalCustomers", label: "Total Customers", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "totalAgents", label: "Total Agents", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
  { key: "totalOrders", label: "Total Orders", icon: Package, color: "text-primary", bg: "bg-primary/10" },
  { key: "pendingOrders", label: "Pending Orders", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  { key: "activeOrders", label: "Active Orders", icon: Truck, color: "text-primary", bg: "bg-orange-50" },
  { key: "completedOrders", label: "Completed", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
] as const;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<AdminStats>("/api/admin/stats"),
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "orders", "recent"],
    queryFn: () => api.get<RecentOrder[]>("/api/admin/orders?limit=10"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of the Get2u Errand platform</p>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <motion.div key={key} variants={item}>
            <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? (
                  <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                ) : (
                  stats?.[key] ?? 0
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="text-primary">
            View all
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Service</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium" />
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const s = STATUS_COLORS[order.status] ?? STATUS_COLORS["pending"];
                  return (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium">{order.customer?.name ?? "—"}</td>
                      <td className="px-5 py-3 capitalize text-muted-foreground">
                        {order.serviceType.replace(/_/g, " ")}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/admin/orders")}
                          className="text-primary hover:text-primary"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
