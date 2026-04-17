import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  Car, 
  User as UserIcon, 
  FileText,
  AlertCircle,
  Loader2,
  ClipboardCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AgentProfile = {
  id: string;
  applicationStatus: "not_applied" | "pending" | "approved" | "rejected";
  licenseImageUrl: string | null;
  idImageUrl: string | null;
  rejectionReason: string | null;
  rating: number;
  totalJobs: number;
  bio: string | null;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: string | null;
  plate: string | null;
  registrationImageUrl: string | null;
  insuranceImageUrl: string | null;
  carImageUrl: string | null;
  isVerified: boolean;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  agentProfile: AgentProfile | null;
  latestVehicle: Vehicle | null;
};

function VettingDialog({ 
  agent, 
  onAction, 
  isPending 
}: { 
  agent: AdminUser; 
  onAction: (status: "approved" | "rejected", reason?: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const profile = agent.agentProfile;
  const car = agent.latestVehicle;

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Review Dossier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bricolage capitalize">Vetting: {agent.name}</DialogTitle>
          <DialogDescription>Review all documentation before granting agent status.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Section 1: Identity */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-orange-500">
              <UserIcon className="h-4 w-4" />
              1. Identity Verification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ID Document / Passport</p>
                <div className="aspect-video rounded-lg border overflow-hidden bg-muted group relative">
                   <img src={profile.idImageUrl || ""} className="w-full h-full object-cover" />
                   <a href={profile.idImageUrl || ""} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">VIEW FULL</a>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Driver's License</p>
                <div className="aspect-video rounded-lg border overflow-hidden bg-muted group relative">
                   <img src={profile.licenseImageUrl || ""} className="w-full h-full object-cover" />
                   <a href={profile.licenseImageUrl || ""} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">VIEW FULL</a>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm italic">
               "{profile.bio || "No professional bio provided."}"
            </div>
          </div>

          {/* Section 2: Vehicle */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-500">
              <Car className="h-4 w-4" />
              2. Vehicle Vetting
            </h3>
            {car ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registration</p>
                    <div className="aspect-video rounded-lg border overflow-hidden bg-muted group relative">
                       <img src={car.registrationImageUrl || ""} className="w-full h-full object-cover" />
                       <a href={car.registrationImageUrl || ""} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">VIEW FULL</a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Insurance</p>
                    <div className="aspect-video rounded-lg border overflow-hidden bg-muted group relative">
                       <img src={car.insuranceImageUrl || ""} className="w-full h-full object-cover" />
                       <a href={car.insuranceImageUrl || ""} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">VIEW FULL</a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 p-3 rounded-lg border bg-blue-500/5 items-center">
                   <img src={car.carImageUrl || ""} className="h-12 w-16 object-cover rounded shadow-sm" />
                   <div>
                      <p className="text-xs font-bold">{car.year} {car.make} {car.model}</p>
                      <p className="text-xs text-muted-foreground bg-secondary px-1.5 rounded inline-block">Plate: {car.plate}</p>
                   </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center border-2 border-dashed rounded-xl">
                 <p className="text-sm text-muted-foreground">No vehicle registered for this agent.</p>
              </div>
            )}
          </div>
        </div>

        {showRejectInput && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="reason" className="text-red-400 font-bold">Reason for Rejection</Label>
            <Textarea 
              id="reason" 
              placeholder="Explain what is missing or incorrect..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="border-red-500/30"
            />
          </div>
        )}

        <DialogFooter className={cn("gap-2 border-t pt-4 mt-4", showRejectInput ? "justify-between" : "")}>
          {showRejectInput ? (
            <>
              <Button variant="ghost" onClick={() => setShowRejectInput(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                disabled={!reason || isPending} 
                onClick={() => onAction("rejected", reason)}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowRejectInput(true)}
              >
                Reject Application
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 font-bold px-8" 
                disabled={isPending}
                onClick={() => onAction("approved")}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Grant Agent Access
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentRow({
  agent,
  onAction,
  isPending,
}: {
  agent: AdminUser;
  onAction: (status: "approved" | "rejected", reason?: string) => void;
  isPending: boolean;
}) {
  const status = agent.agentProfile?.applicationStatus || "not_applied";
  
  return (
    <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-4 font-medium">
        <div className="flex flex-col">
          <span>{agent.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{agent.id}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">{agent.email}</td>
      <td className="px-4 py-4">
        {status === "approved" ? (
          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Verified
          </span>
        ) : status === "pending" ? (
          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse">
            Review Required
          </span>
        ) : status === "rejected" ? (
          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-red-500/10 text-red-500 border border-red-500/20">
            Rejected
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-4">
         <div className="flex items-center gap-1.5 text-xs">
            <Car className="h-3 w-3 text-blue-500" />
            {agent.latestVehicle ? (
              <span className="font-medium">{agent.latestVehicle.make} {agent.latestVehicle.model}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
         </div>
      </td>
      <td className="px-4 py-4">
        <VettingDialog agent={agent} onAction={onAction} isPending={isPending} />
      </td>
    </tr>
  );
}

const TABLE_HEADERS = ["Agent Name", "Email / Account", "Vetting Status", "Equipment", "Actions"];

export default function AdminAgents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: () => api.get<AdminUser[]>("/api/admin/users?role=agent"), // Note: The backend returns them if they are an agent or if status is not null
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ["admin", "pending-agents"],
    queryFn: () => api.get<AdminUser[]>("/api/admin/users"), 
    select: (data) => data.filter(u => u.agentProfile?.applicationStatus === "pending")
  });

  const vetMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: "approved" | "rejected"; reason?: string }) =>
      api.patch(`/api/admin/users/${userId}/approve-agent`, { status, rejectionReason: reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast({ 
        title: vars.status === "approved" ? "Agent Verified" : "Application Rejected",
        description: vars.status === "approved" ? "The user can now start taking jobs." : "They will be notified of the reason."
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const all = agents;

  const renderTable = (list: AdminUser[]) => (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
            {TABLE_HEADERS.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            list.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                isPending={vetMutation.isPending}
                onAction={(status, reason) => vetMutation.mutate({ userId: agent.id, status, reason })}
              />
            ))
          )}
        </tbody>
      </table>
      {list.length === 0 && !isLoading && (
         <div className="py-20 text-center text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p className="font-bricolage font-medium">No vetting applications found.</p>
         </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bricolage font-bold">Agent Vetting</h1>
         <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-bold">
               <ShieldCheck className="h-4 w-4" />
               SECURE Dossier Review
            </div>
         </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-muted/50 border h-11 p-1">
          <TabsTrigger value="pending" className="px-6 h-9 data-[state=active]:bg-card">
            Queue for Review
            {pendingUsers.length > 0 ? (
              <span className="ml-2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
                {pendingUsers.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="all" className="px-6 h-9 data-[state=active]:bg-card">Active Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 outline-none">
          {renderTable(pendingUsers)}
        </TabsContent>
        <TabsContent value="all" className="mt-4 outline-none">
          {renderTable(all)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
   return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
         <path d="m9 12 2 2 4-4" />
      </svg>
   )
}

