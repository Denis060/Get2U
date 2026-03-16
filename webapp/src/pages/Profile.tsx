import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  ArrowLeftRight,
  Loader2,
  Plus,
  Trash2,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { UserProfile, VehicleResponse } from "@/types/orders";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function Profile() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<UserProfile>("/api/me"),
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<VehicleResponse[]>("/api/vehicles"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { name: profile.name, phone: profile.phone ?? "", address: profile.address ?? "" }
      : undefined,
  });

  const {
    register: registerVehicle,
    handleSubmit: handleVehicleSubmit,
    reset: resetVehicle,
    formState: { errors: vehicleErrors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) => api.patch<UserProfile>("/api/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const switchRole = useMutation({
    mutationFn: () => api.patch<UserProfile>("/api/me/role", { role: "agent" }),
    onSuccess: () => {
      navigate("/agent");
    },
  });

  const addVehicle = useMutation({
    mutationFn: (data: VehicleFormData) => api.post<VehicleResponse>("/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setVehicleDialogOpen(false);
      resetVehicle();
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (vehicleId: string) => api.delete(`/api/vehicles/${vehicleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Avatar & basic info */}
      <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{profile?.name ?? user?.name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" />
            {profile?.role ?? "customer"}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
        <h3 className="text-sm font-semibold">Personal Information</h3>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Name
          </Label>
          <Input id="name" {...register("name")} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
          </Label>
          <Input value={profile?.email ?? ""} disabled className="opacity-60" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
          </Label>
          <Input id="phone" placeholder="Enter phone number" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Address
          </Label>
          <Input id="address" placeholder="Enter your address" {...register("address")} />
        </div>

        <Button type="submit" className="w-full" disabled={!isDirty || updateProfile.isPending}>
          {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {updateProfile.isSuccess ? "Saved!" : "Save Changes"}
        </Button>
      </form>

      {/* My Vehicles */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">My Vehicles</h3>
          <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVehicleSubmit((d) => addVehicle.mutate(d))} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Make</Label>
                    <Input placeholder="Toyota" {...registerVehicle("make")} />
                    {vehicleErrors.make ? <p className="text-xs text-destructive">{vehicleErrors.make.message}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Model</Label>
                    <Input placeholder="Camry" {...registerVehicle("model")} />
                    {vehicleErrors.model ? <p className="text-xs text-destructive">{vehicleErrors.model.message}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Year</Label>
                    <Input placeholder="2024" {...registerVehicle("year")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Input placeholder="Black" {...registerVehicle("color")} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Plate Number</Label>
                  <Input placeholder="ABC-1234" {...registerVehicle("plate")} />
                </div>
                <Button type="submit" className="w-full" disabled={addVehicle.isPending}>
                  {addVehicle.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {vehiclesLoading ? (
          <div className="h-16 animate-pulse rounded-lg bg-secondary" />
        ) : (vehicles ?? []).length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No vehicles added yet</p>
        ) : (
          <div className="space-y-2">
            {(vehicles ?? []).map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[v.color, v.plate].filter(Boolean).join(" - ") || "No details"}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete vehicle?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove {v.make} {v.model} from your vehicles.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVehicle.mutate(v.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => switchRole.mutate()}
          disabled={switchRole.isPending}
        >
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Switch to Agent Mode
        </Button>

        <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
}
