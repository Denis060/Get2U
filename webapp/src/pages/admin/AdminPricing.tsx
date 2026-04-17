import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Settings, 
  Database, 
  Truck, 
  Car, 
  Mail, 
  Package,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Plan = {
  id: string;
  name: string;
  category: "delivery" | "car";
  price: number;
  interval: string;
  features: string[];
  isPopular: boolean;
  stripePriceId?: string;
};

type BusinessTier = {
  id: string;
  plan: string;
  volume: string;
  price: number;
  interval: string;
};

type ServiceFee = {
  id: string;
  name: string;
  description?: string;
  baseFee: number;
  serviceType?: string;
};

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [editingTier, setEditingTier] = useState<Partial<BusinessTier> | null>(null);
  const [editingFee, setEditingFee] = useState<Partial<ServiceFee> | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ["public-pricing"],
    queryFn: () => api.get<{ plans: Plan[]; businessTiers: BusinessTier[]; serviceFees: ServiceFee[] }>("/api/config/pricing"),
  });

  const planMutation = useMutation({
    mutationFn: (values: Partial<Plan>) => 
      values.id ? api.patch(`/api/admin/pricing-plans/${values.id}`, values) : api.post("/api/admin/pricing-plans", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
      setEditingPlan(null);
      toast({ title: "Plan saved successfully" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/pricing-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
      toast({ title: "Plan deleted" });
    },
  });

  const tierMutation = useMutation({
    mutationFn: (values: Partial<BusinessTier>) => 
      values.id ? api.patch(`/api/admin/business-tiers/${values.id}`, values) : api.post("/api/admin/business-tiers", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
      setEditingTier(null);
      toast({ title: "Business tier saved" });
    },
  });

  const feeMutation = useMutation({
    mutationFn: (values: Partial<ServiceFee>) => 
      values.id ? api.patch(`/api/admin/service-fees/${values.id}`, values) : api.post("/api/admin/service-fees", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
      setEditingFee(null);
      toast({ title: "Service fee updated" });
    },
  });

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 pb-20 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">Manage your subscription tiers and service fees.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Subscription Plans */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Subscription Plans</h2>
          </div>
          <Button onClick={() => setEditingPlan({ name: "", category: "delivery", price: 0, interval: "month", features: [], isPopular: false })} className="rounded-xl h-10 gap-2">
            <Plus className="h-4 w-4" /> Add Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config?.plans.map((plan) => (
            <Card key={plan.id} className={cn("relative overflow-hidden border-border/40 transition-all hover:border-primary/40", plan.isPopular && "border-amber-500/40")}>
              {plan.isPopular && <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>}
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  {plan.category === "delivery" ? <Package className="h-3 w-3 text-amber-500" /> : <Car className="h-3 w-3 text-emerald-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{plan.category}</span>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">${plan.price}<span className="text-xs font-normal text-muted-foreground">/{plan.interval}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                   <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Stripe Price ID</p>
                   <code className="text-[10px] bg-muted px-2 py-1 rounded truncate block">{plan.stripePriceId || "Not set"}</code>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)} className="flex-1 rounded-lg">
                  <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deletePlanMutation.mutate(plan.id)} className="h-9 w-9 p-0 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Plan Editor Dialog Placeholder - Simplified for now with relative form */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>{editingPlan.id ? "Edit Plan" : "Create New Plan"}</CardTitle>
              <CardDescription>Configure the details for this subscription tier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Plan Name</Label>
                <Input value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} placeholder="e.g., Premium Delivery" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={editingPlan.category} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value as any })}
                  >
                    <option value="delivery">Delivery</option>
                    <option value="car">Car Service</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Price ($)</Label>
                  <Input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Stripe Price ID</Label>
                <Input value={editingPlan.stripePriceId} onChange={(e) => setEditingPlan({ ...editingPlan, stripePriceId: e.target.value })} placeholder="price_123..." />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="popular" checked={editingPlan.isPopular} onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isPopular: !!checked })} />
                <Label htmlFor="popular">Marker as Popular</Label>
              </div>
              <div className="grid gap-2">
                <Label>Features (one per line)</Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={editingPlan.features?.join("\n")} 
                  onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split("\n").filter(Boolean) })}
                  placeholder="Unlimited mail dispatch..." 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/40 pt-6">
              <Button variant="ghost" onClick={() => setEditingPlan(null)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => planMutation.mutate(editingPlan)} className="rounded-xl px-8" disabled={planMutation.isPending}>
                {planMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Business Tiers and Flat Fees Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/40 pt-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Business Tiers</h2>
            </div>
          </div>
          <Card className="border-border/40 bg-card/40">
             <CardContent className="p-0">
               <div className="divide-y divide-border/30">
                 {config?.businessTiers.map((tier) => (
                   <div key={tier.id} className="flex items-center justify-between p-4 group">
                      <div>
                        <p className="font-bold text-sm">{tier.plan}</p>
                        <p className="text-xs text-muted-foreground">{tier.volume}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                         <span className="font-bold text-primary">${tier.price}</span>
                        <Button variant="ghost" size="sm" onClick={() => setEditingTier(tier)} className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"><Edit2 className="h-3 w-3" /></Button>
                      </div>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
            <AlertCircle className="h-4 w-4" />
            <span>Business tiers are typically used for volume-based package delivery billing.</span>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Service Fees</h2>
            </div>
          </div>
          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-0">
               <div className="divide-y divide-border/30">
                 {config?.serviceFees.map((fee) => (
                   <div key={fee.id} className="flex items-center justify-between p-4 group">
                      <div>
                        <p className="font-bold text-sm">{fee.name}</p>
                        {fee.description && <p className="text-xs text-muted-foreground">{fee.description}</p>}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                         <span className="font-bold text-emerald-500">${fee.baseFee}</span>
                        <Button variant="ghost" size="sm" onClick={() => setEditingFee(fee)} className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"><Edit2 className="h-3 w-3" /></Button>
                      </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
            <AlertCircle className="h-4 w-4" />
            <span>Flat fees applied per-request for Non-Subscription "Pay As You Go" services.</span>
          </div>
        </section>
      </div>
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>{editingTier.id ? "Edit Tier" : "Create New Tier"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Plan Name</Label>
                <Input value={editingTier.plan} onChange={(e) => setEditingTier({ ...editingTier, plan: e.target.value })} placeholder="e.g. Enterprise" />
              </div>
              <div className="grid gap-2">
                <Label>Volume Label</Label>
                <Input value={editingTier.volume} onChange={(e) => setEditingTier({ ...editingTier, volume: e.target.value })} placeholder="e.g. 50-100 pkgs/mo" />
              </div>
              <div className="grid gap-2">
                <Label>Price ($)</Label>
                <Input type="number" value={editingTier.price} onChange={(e) => setEditingTier({ ...editingTier, price: Number(e.target.value) })} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="ghost" onClick={() => setEditingTier(null)}>Cancel</Button>
              <Button onClick={() => tierMutation.mutate(editingTier)} disabled={tierMutation.isPending}>
                 {tierMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                 Save Tier
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Edit Service Fee</CardTitle>
              <CardDescription>Adjust the flat fee for pay-as-you-go requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Fee Name</Label>
                <Input value={editingFee.name} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>Base Fee ($)</Label>
                <Input type="number" value={editingFee.baseFee} onChange={(e) => setEditingFee({ ...editingFee, baseFee: Number(e.target.value) })} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="ghost" onClick={() => setEditingFee(null)}>Cancel</Button>
              <Button onClick={() => feeMutation.mutate(editingFee)} disabled={feeMutation.isPending}>
                 {feeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                 Update Fee
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
