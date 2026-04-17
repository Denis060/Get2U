import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types/orders";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<UserProfile>("/api/me"),
    enabled: !!session,
  });

  if (sessionPending || profileLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Verifying account status...</p>
      </div>
    );
  }

  // If user has NO subscription plan assigned, block them
  const hasSubscription = !!profile?.subscriptionPlanId;

  if (!hasSubscription) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Subscription Required</h2>
          <p className="mt-3 max-w-[280px] text-sm text-muted-foreground leading-relaxed">
            This service is exclusive to our subscribed members. Choose a plan to unlock full access to Get2U services.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3">
            <Button 
               size="lg" 
               className="h-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
               onClick={() => navigate("/pricing")}
            >
              View Pricing Plans
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
               variant="ghost" 
               className="h-12 rounded-2xl text-muted-foreground"
               onClick={() => navigate("/dashboard")}
            >
              Return Home
            </Button>
          </div>

          {/* Value Props */}
          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 text-left">
                <ShieldAlert className="h-5 w-5 text-amber-500 mb-2" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Verified Agents</p>
                <p className="text-[10px] text-muted-foreground">Vetted and secure</p>
             </div>
             <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 text-left">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">24/7 Access</p>
                <p className="text-[10px] text-muted-foreground">Help when you need it</p>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
