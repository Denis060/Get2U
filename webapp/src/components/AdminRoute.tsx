import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" replace />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
