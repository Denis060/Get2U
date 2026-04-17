import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Users, 
  UserRound, 
  Briefcase,
  Loader2,
  MoreHorizontal,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  content: string;
  target: string;
  active: boolean;
  createdAt: string;
};

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", target: "all" });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => api.get<Announcement[]>("/api/admin/announcements"),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newAnn) => api.post("/api/admin/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast({ title: "Announcement published" });
      setIsAdding(false);
      setNewAnn({ title: "", content: "", target: "all" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast({ title: "Announcement deleted" });
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Marketing & Announcements</h1>
            <p className="text-sm text-muted-foreground">Keep your community informed with platform updates.</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-xl gap-2 h-11 px-5 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Create New
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Compose Announcement</CardTitle>
            <CardDescription>This message will be visible to all targeted users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={newAnn.title} 
                onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                placeholder="e.g. System Maintenance, New Promotion!" 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <div className="flex gap-3">
                {[
                  { id: "all", label: "Everyone", icon: Users },
                  { id: "customer", label: "Customers", icon: UserRound },
                  { id: "agent", label: "Agents", icon: Briefcase },
                ].map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setNewAnn({ ...newAnn, target: target.id })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all font-medium",
                      newAnn.target === target.id 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border/60 hover:bg-muted"
                    )}
                  >
                    <target.icon className="h-4 w-4" />
                    <span className="text-sm">{target.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea 
                value={newAnn.content}
                onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                placeholder="What do you want to tell them?" 
                className="min-h-[120px] rounded-xl resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 pt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-11 px-6">Cancel</Button>
            <Button 
               onClick={() => createMutation.mutate(newAnn)} 
               disabled={!newAnn.title || !newAnn.content || createMutation.isPending}
               className="rounded-xl h-11 px-8 gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Announcement
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent History
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary/40" /></div>
        ) : announcements.length === 0 ? (
          <Card className="border-dashed border-2 py-10">
            <CardContent className="flex flex-col items-center text-muted-foreground">
              <Megaphone className="h-10 w-10 mb-2 opacity-20" />
              <p>No announcements sent yet.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className="group border-border/60 transition-all hover:border-primary/20">
              <CardHeader className="pb-3 flex-row items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{ann.title}</CardTitle>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      ann.target === "all" ? "bg-blue-100 text-blue-700" : 
                      ann.target === "agent" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {ann.target}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Sent {new Date(ann.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(ann.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                  "{ann.content}"
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
