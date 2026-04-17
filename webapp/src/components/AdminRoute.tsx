import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserProfile } from "@/types/orders";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  
  // Resilient check: Session can be stale, so we also check the fresh profile query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<UserProfile>("/api/me"),
    enabled: !!session?.user,
  });

  if (sessionPending || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" replace />;
  
  // Use either the session role or the fresh profile role
  const role = profile?.role || (session.user as any).role;
  
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
