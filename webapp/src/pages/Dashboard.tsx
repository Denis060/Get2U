import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Package, Truck, Car, ChevronRight, Inbox, Moon, Sun, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from "@/components/StatusBadge";
import SkeletonOrderCard from "@/components/SkeletonOrderCard";
import { getServiceIcon, getServiceLabel, getServiceIconColor } from "@/lib/service-helpers";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { OrderResponse } from "@/types/orders";

const QUICK_ACTIONS = [
  { type: "send_mail", label: "Send Mail", desc: "Letters & docs", icon: Mail, bg: "bg-amber-500/15", iconColor: "text-amber-400" },
  { type: "send_package", label: "Send Package", desc: "Any size", icon: Package, bg: "bg-blue-500/15", iconColor: "text-blue-400" },
  { type: "pickup_dropoff", label: "Pickup & Drop", desc: "Pick & deliver", icon: Truck, bg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { type: "car_wash", label: "Car Services", desc: "Wash & more", icon: Car, bg: "bg-purple-500/15", iconColor: "text-purple-400" },
];

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Dashboard() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [dismissedAnns, setDismissedAnns] = useState<string[]>([]);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<any[]>("/api/config/announcements"),
  });

  const activeAnn = announcements.find(a => 
    !dismissedAnns.includes(a.id) && 
    (a.target === "all" || a.target === session?.user?.role)
  );

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<OrderResponse[]>("/api/orders"),
  });

  const recentOrders = orders?.slice(0, 5) ?? [];
  const timeOfDay = getTimeOfDay();

  return (
    <div className={cn("space-y-0", isMobile ? "" : "space-y-8")}>
      {/* Page Header */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile ? "px-4 pt-3 pb-4" : "pb-6"
      )}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Good {timeOfDay}
          </p>
          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {firstName} 👋
          </h1>
        </div>
        {isMobile && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* Announcement Banner */}
      {activeAnn && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className={cn(isMobile ? "mx-4 mb-4" : "mb-6")}
        >
           <div className="relative overflow-hidden rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 flex items-start gap-4">
              <div className="p-2 bg-orange-500 rounded-xl text-white">
                <Megaphone size={18} />
              </div>
              <div className="flex-1 pr-8">
                 <h4 className="text-sm font-bold text-orange-600 leading-none">{activeAnn.title}</h4>
                 <p className="mt-1 text-xs text-orange-800/80 leading-relaxed font-medium">
                   {activeAnn.content}
                 </p>
              </div>
              <button 
                onClick={() => setDismissedAnns([...dismissedAnns, activeAnn.id])}
                className="absolute top-4 right-4 text-orange-500/50 hover:text-orange-600 transition-colors"
              >
                <X size={16} />
              </button>
           </div>
        </motion.div>
      )}

      {/* Hero Banner */}
      <div className={cn(isMobile ? "mx-4 mb-6" : "mb-8")}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-400 p-5 shadow-lg shadow-primary/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-8 h-20 w-20 rounded-full bg-white/10" />
          <p className="relative text-xs font-semibold uppercase tracking-widest text-orange-100">
            Get2u Errand
          </p>
          <h2 className="relative mt-1 text-xl font-bold text-white">
            What do you need today?
          </h2>
          <p className="relative mt-1 text-sm text-orange-100/90">
            Fast, reliable errands at your fingertips.
          </p>
          <Button
            size="sm"
            className="relative mt-4 h-9 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50"
            onClick={() => navigate("/new-request")}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Services Section */}
      <section className={cn(isMobile ? "px-4 mb-6" : "mb-8")}>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Services
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.type}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(`/new-request?type=${action.type}`)}
              className="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-colors hover:bg-secondary active:bg-secondary"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", action.bg)}>
                <action.icon className={cn("h-5 w-5", action.iconColor)} />
              </div>
              <span className="text-center text-[10px] font-semibold leading-tight text-foreground">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section className={cn(isMobile ? "px-4" : "")}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Recent Orders
          </p>
          {recentOrders.length > 0 && (
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonOrderCard key={i} />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-10 text-center">
            <Inbox className="mb-3 h-9 w-9 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No orders yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              Create your first errand to get started
            </p>
            <Button size="sm" className="mt-4 h-9 rounded-xl" onClick={() => navigate("/new-request")}>
              New Request
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            {recentOrders.map((order, idx) => {
              const Icon = getServiceIcon(order.serviceType);
              const iconColor = getServiceIconColor(order.serviceType);
              return (
                <motion.button
                  key={order.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary",
                    idx < recentOrders.length - 1 ? "border-b border-border/30" : ""
                  )}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary", iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{getServiceLabel(order.serviceType)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom padding for mobile */}
      {isMobile && <div className="h-4" />}
    </div>
  );
}
