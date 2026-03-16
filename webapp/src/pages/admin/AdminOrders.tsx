import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserPlus } from "lucide-react";
import { STATUS_COLORS } from "@/types/orders";
import { useToast } from "@/hooks/use-toast";

type AdminOrder = {
  id: string;
  category: string;
  serviceType: string;
  status: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  carLocation: string | null;
  createdAt: string;
  estimatedPrice: number | null;
  customer: { id: string; name: string; email: string } | null;
  agent: { id: string; name: string; email: string } | null;
};

type AgentUser = {
  id: string;
  name: string;
  email: string;
};

const STATUSES = ["all", "pending", "accepted", "in_progress", "completed", "cancelled"];
const CATEGORIES = ["all", "delivery", "car"];
const PAGE_SIZE = 20;

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [assignOrder, setAssignOrder] = useState<AdminOrder | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category !== "all") params.set("category", category);
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(page * PAGE_SIZE));

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders", status, category, page],
    queryFn: () => api.get<AdminOrder[]>(`/api/admin/orders?${params}`),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["admin", "agents-list"],
    queryFn: () => api.get<AgentUser[]>("/api/admin/users?role=agent"),
    enabled: !!assignOrder,
  });

  const assignMutation = useMutation({
    mutationFn: ({ orderId, agentId }: { orderId: string; agentId: string }) =>
      api.patch(`/api/admin/orders/${orderId}/assign`, { agentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast({ title: "Agent assigned successfully" });
      setAssignOrder(null);
      setSelectedAgent("");
    },
  });

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.serviceType.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Orders</h2>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Service</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Agent</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const s = STATUS_COLORS[order.status] ?? STATUS_COLORS["pending"];
                return (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-medium">{order.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {order.serviceType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.agent?.name ?? <span className="italic text-muted-foreground/60">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignOrder(order)}
                        className="gap-1 text-xs"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assign
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page + 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={filtered.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={!!assignOrder} onOpenChange={(open) => { if (!open) { setAssignOrder(null); setSelectedAgent(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Order: <span className="font-mono">{assignOrder?.id.slice(0, 8)}…</span>
            {" — "}{assignOrder?.serviceType.replace(/_/g, " ")}
          </p>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {(agents as AgentUser[]).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.email})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignOrder(null); setSelectedAgent(""); }}>
              Cancel
            </Button>
            <Button
              disabled={!selectedAgent || assignMutation.isPending}
              onClick={() => assignOrder && assignMutation.mutate({ orderId: assignOrder.id, agentId: selectedAgent })}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
