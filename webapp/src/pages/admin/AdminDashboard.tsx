import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Users, UserCheck, Package, Clock, Truck, CheckCircle, TrendingUp, BarChart3, PieChart as PieChartIcon, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS } from "@/types/orders";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type AdminStats = {
  totalCustomers: number;
  totalAgents: number;
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalMessages: number;
  pendingVettings: number;
};

type AnalyticsData = {
  orderTrends: Array<{ date: string; count: number; revenue: number }>;
  userTrends: Array<{ date: string; customers: number; agents: number }>;
  serviceDistribution: Array<{ name: string; value: number }>;
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
  { key: "pendingOrders", label: "Pending Orders", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", link: "/admin/orders?status=pending" },
  { key: "activeOrders", label: "Active Orders", icon: Truck, color: "text-primary", bg: "bg-orange-50", link: "/admin/orders?status=active" },
  { key: "pendingVettings", label: "Pending Vetting", icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50", link: "/admin/agents", pulse: true },
] as const;

const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f59e0b"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<AdminStats>("/api/admin/stats"),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.get<AnalyticsData>("/api/admin/analytics"),
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "orders", "recent"],
    queryFn: () => api.get<RecentOrder[]>("/api/admin/orders?limit=10"),
  });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform analytics and performance metrics</p>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, link, pulse }) => (
          <motion.div key={key} variants={item}>
            <div 
              onClick={() => link && navigate(link)}
              className={cn(
                "group cursor-pointer rounded-2xl border border-border/40 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20",
                pulse && (stats?.[key as keyof AdminStats] ?? 0) > 0 && "animate-pulse border-red-500/30 ring-1 ring-red-500/10"
              )}
            >
              <div className={cn("mb-3 inline-flex rounded-xl p-2.5 transition-colors group-hover:scale-110", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
                ) : (
                  stats?.[key as keyof AdminStats] ?? 0
                )}
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border border-border/40 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Order Volume (Last 30 Days)
            </div>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">30D Trend</Badge>
          </div>
          <div className="h-[300px] w-full">
            {analyticsLoading ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/20">
                <BarChart3 className="h-8 w-8 animate-pulse text-muted-foreground/30" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.orderTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { dateStyle: 'full' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Service Type Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Service Distribution
            </div>
          </div>
          <div className="h-[300px] w-full">
            {analyticsLoading ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/20">
                <PieChartIcon className="h-8 w-8 animate-pulse text-muted-foreground/30" />
              </div>
            ) : (analytics?.serviceDistribution.length || 0) === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">No service data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics?.serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {!analyticsLoading && (analytics?.serviceDistribution.length || 0) > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {analytics?.serviceDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-[10px] font-medium text-muted-foreground capitalize truncate">{entry.name.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-border/40 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5 bg-muted/5">
          <h3 className="font-bold text-foreground">Recent Activity</h3>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")} className="h-8 rounded-lg text-xs font-semibold">
            Manage All Orders
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20 text-muted-foreground/80 bg-muted/5">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                       <Clock className="h-10 w-10 mb-2 opacity-10" />
                       <p className="text-sm font-medium">No order activity recorded yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const s = STATUS_COLORS[order.status] ?? STATUS_COLORS["pending"];
                  return (
                    <tr key={order.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-semibold text-foreground">{order.customer?.name ?? "Guest User"}</span>
                           <span className="text-[11px] text-muted-foreground font-mono">{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-muted-foreground font-medium">
                        {order.serviceType.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/orders`)}
                          className="h-8 w-8 p-0 text-primary rounded-full hover:bg-primary/5"
                        >
                          <ChevronRight className="h-4 w-4" />
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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
