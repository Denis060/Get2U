import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCheck,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ["super_admin", "dispatcher", "finance", "marketing", "vetting_officer", "support"] },
  { path: "/admin/orders", label: "Orders", icon: ClipboardList, roles: ["super_admin", "dispatcher", "support", "finance"] },
  { path: "/admin/customers", label: "Customers", icon: Users, roles: ["super_admin", "marketing", "vetting_officer"] },
  { path: "/admin/agents", label: "Agents", icon: UserCheck, roles: ["super_admin", "vetting_officer", "dispatcher"] },
  { path: "/admin/messages", label: "Messages", icon: MessageSquare, roles: ["super_admin", "dispatcher", "support"] },
  { path: "/admin/pricing", label: "Pricing", icon: LayoutDashboard, roles: ["super_admin", "finance"] },
  { path: "/admin/announcements", label: "Announcements", icon: Megaphone, roles: ["super_admin", "marketing"] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const user = session?.user as any;
  const adminRole = user?.adminRole || "support";

  const visibleNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(adminRole) || adminRole === "super_admin"
  );

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path || location.pathname.startsWith(item.path + "/");

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-foreground">Get2u Errand</span>
          <div className="flex flex-col gap-0.5 mt-1">
            <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary w-fit">
              Admin
            </span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
              {adminRole.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {visibleNavItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active ? (
                <motion.div
                  layoutId="adminActiveNav"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function AdminLayout() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border/60 bg-white md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Right side: topbar + content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-white/80 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-sm font-semibold text-foreground">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">{user?.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
