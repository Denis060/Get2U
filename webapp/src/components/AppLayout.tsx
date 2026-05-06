import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import FloatingChat from "@/components/FloatingChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  ClipboardList,
  User,
  LogOut,
  ArrowLeftRight,
  Tag,
  Moon,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/new-request", label: "New", icon: Plus },
  { path: "/pricing", label: "Pricing", icon: Tag },
  { path: "/orders", label: "Orders", icon: ClipboardList },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const { data: session } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Desktop Top Navbar - hidden on mobile */}
      {!isMobile && (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 font-bricolage text-xl font-bold tracking-tight"
            >
              <span className="text-primary">Get2u</span>
              <span className="text-foreground">Errand</span>
            </button>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-transparent transition-all hover:ring-primary/40 focus:outline-none focus:ring-primary/40">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      {/* Mobile safe area top spacer */}
      {isMobile && (
        <div style={{ height: "env(safe-area-inset-top)" }} className="bg-background shrink-0" />
      )}

      {/* Main Content */}
      <main className={cn("flex-1", isMobile ? "pb-[calc(4rem+env(safe-area-inset-bottom))]" : "")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(isMobile ? "w-full" : "mx-auto w-full max-w-7xl px-4 py-6")}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingChat />

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex h-16 items-stretch justify-around">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.82 }}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2",
                    active ? "text-primary" : "text-muted-foreground/70"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="tabBg"
                      className="absolute inset-x-3 inset-y-1 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    className={cn("relative h-5 w-5", active ? "text-primary" : "")}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  <span
                    className={cn(
                      "relative text-[10px] font-semibold tracking-tight",
                      active ? "text-primary" : "text-muted-foreground/70"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
