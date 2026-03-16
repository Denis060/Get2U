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
  ChevronRight,
  Moon,
  Sun,
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
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  rightEl?: React.ReactNode;
}

function SettingsRow({ icon, label, value, chevron = true, destructive = false, onClick, rightEl }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-secondary",
        destructive ? "text-destructive" : "text-foreground"
      )}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", destructive ? "bg-destructive/10" : "bg-secondary")}>
        {icon}
      </span>
      <span className={cn("flex-1 text-sm font-medium", destructive ? "text-destructive" : "text-foreground")}>{label}</span>
      {value ? <span className="text-sm text-muted-foreground">{value}</span> : null}
      {rightEl ? rightEl : null}
      {chevron ? <ChevronRight className={cn("h-4 w-4 shrink-0", destructive ? "text-destructive/40" : "text-muted-foreground/40")} /> : null}
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-1 px-4 pt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
  );
}

export default function Profile() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

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
      setEditOpen(false);
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

  const px = isMobile ? "" : "px-0";

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
      className={cn("pb-6", isMobile ? "" : "mx-auto max-w-lg")}
    >
      {/* Page header */}
      <div className={cn("pb-2 pt-4", isMobile ? "px-4" : "")}>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Avatar card */}
      <div className={cn("mb-2 flex flex-col items-center gap-3 py-6", isMobile ? "px-4" : "")}>
        <Avatar className="h-20 w-20 ring-4 ring-primary/20">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{profile?.name ?? user?.name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="h-3 w-3" />
            {profile?.role ?? "customer"}
          </div>
        </div>
      </div>

      {/* Account section */}
      <SectionHeader label="Account" />
      <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card", isMobile ? "mx-4" : "")}>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <div>
              <SettingsRow
                icon={<User className="h-4 w-4 text-blue-400" />}
                label="Edit Profile"
                value={profile?.name}
              />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Name
                </Label>
                <Input id="name" className="h-12" {...register("name")} />
                {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                </Label>
                <Input value={profile?.email ?? ""} disabled className="h-12 opacity-60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
                </Label>
                <Input id="phone" placeholder="Enter phone number" className="h-12" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Address
                </Label>
                <Input id="address" placeholder="Enter your address" className="h-12" {...register("address")} />
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl" disabled={!isDirty || updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <div className="border-t border-border/30" />
        <SettingsRow
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          label="Email"
          value={profile?.email ?? user?.email ?? ""}
          chevron={false}
        />
        {profile?.phone ? (
          <>
            <div className="border-t border-border/30" />
            <SettingsRow
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
              label="Phone"
              value={profile.phone}
              chevron={false}
            />
          </>
        ) : null}
        {profile?.address ? (
          <>
            <div className="border-t border-border/30" />
            <SettingsRow
              icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
              label="Address"
              value={profile.address}
              chevron={false}
            />
          </>
        ) : null}
      </div>

      {/* Vehicles section */}
      <SectionHeader label="My Vehicles" />
      <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card", isMobile ? "mx-4" : "")}>
        {vehiclesLoading ? (
          <div className="h-14 animate-pulse bg-secondary/50" />
        ) : (vehicles ?? []).length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No vehicles added yet</p>
        ) : (
          (vehicles ?? []).map((v, idx) => (
            <div key={v.id}>
              {idx > 0 ? <div className="border-t border-border/30" /> : null}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Car className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[v.color, v.plate].filter(Boolean).join(" · ") || "No details"}
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
            </div>
          ))
        )}
        <div className="border-t border-border/30" />
        <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex w-full items-center gap-3 px-4 py-3.5 text-primary transition-colors active:bg-secondary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </span>
              <span className="text-sm font-medium text-primary">Add Vehicle</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVehicleSubmit((d) => addVehicle.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Make</Label>
                  <Input placeholder="Toyota" className="h-12" {...registerVehicle("make")} />
                  {vehicleErrors.make ? <p className="text-xs text-destructive">{vehicleErrors.make.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Model</Label>
                  <Input placeholder="Camry" className="h-12" {...registerVehicle("model")} />
                  {vehicleErrors.model ? <p className="text-xs text-destructive">{vehicleErrors.model.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Year</Label>
                  <Input placeholder="2024" className="h-12" {...registerVehicle("year")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Input placeholder="Black" className="h-12" {...registerVehicle("color")} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Plate Number</Label>
                <Input placeholder="ABC-1234" className="h-12" {...registerVehicle("plate")} />
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl" disabled={addVehicle.isPending}>
                {addVehicle.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Vehicle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preferences section */}
      <SectionHeader label="Preferences" />
      <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card", isMobile ? "mx-4" : "")}>
        <SettingsRow
          icon={theme === "dark" ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
          label={theme === "dark" ? "Dark Mode" : "Light Mode"}
          chevron={false}
          onClick={toggleTheme}
          rightEl={
            <div
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                theme === "dark" ? "bg-primary" : "bg-border"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </div>
          }
        />
      </div>

      {/* Agent section */}
      <SectionHeader label="Work" />
      <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card", isMobile ? "mx-4" : "")}>
        <SettingsRow
          icon={<ArrowLeftRight className="h-4 w-4 text-emerald-400" />}
          label="Switch to Agent Mode"
          onClick={() => switchRole.mutate()}
        />
      </div>

      {/* Danger zone */}
      <SectionHeader label="Account" />
      <div className={cn("overflow-hidden rounded-2xl border border-destructive/20 bg-card", isMobile ? "mx-4" : "")}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div>
              <SettingsRow
                icon={<LogOut className="h-4 w-4 text-destructive" />}
                label="Sign Out"
                destructive
              />
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="h-4" />
    </motion.div>
  );
}
