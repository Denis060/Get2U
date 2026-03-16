import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { ordersAsCustomer: number; ordersAsAgent: number };
  agentProfile: { approved: boolean; rating: number; totalJobs: number } | null;
};

function AgentRow({
  agent,
  onApprove,
  onReject,
  isPending,
}: {
  agent: AdminUser;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const approved = agent.agentProfile?.approved;
  return (
    <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-medium">{agent.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{agent.email}</td>
      <td className="px-4 py-3 text-muted-foreground">{agent.phone ?? "—"}</td>
      <td className="px-4 py-3">
        {agent.agentProfile ? (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span>{agent.agentProfile.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{agent.agentProfile?.totalJobs ?? 0}</td>
      <td className="px-4 py-3">
        {approved === true ? (
          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
            Approved
          </span>
        ) : approved === false ? (
          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending || approved === true}
            onClick={onApprove}
            className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onReject}
            className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      </td>
    </tr>
  );
}

const TABLE_HEADERS = ["Name", "Email", "Phone", "Rating", "Jobs", "Status", "Actions"];

export default function AdminAgents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: () => api.get<AdminUser[]>("/api/admin/users?role=agent"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ userId, approve }: { userId: string; approve: boolean }) =>
      api.patch(`/api/admin/users/${userId}/approve-agent`, { approve }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      toast({ title: vars.approve ? "Agent approved" : "Agent rejected" });
    },
  });

  const pending = agents.filter((a) => a.agentProfile && !a.agentProfile.approved);
  const all = agents;

  const renderTable = (list: AdminUser[]) => (
    <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 text-muted-foreground">
            {TABLE_HEADERS.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                No agents found.
              </td>
            </tr>
          ) : (
            list.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                isPending={approveMutation.isPending}
                onApprove={() => approveMutation.mutate({ userId: agent.id, approve: true })}
                onReject={() => approveMutation.mutate({ userId: agent.id, approve: false })}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Agents</h2>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval
            {pending.length > 0 ? (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pending.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="all">All Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {renderTable(pending)}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTable(all)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
