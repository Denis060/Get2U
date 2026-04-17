import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Car,
  FileCheck,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const applySchema = z.object({
  idType: z.enum(["drivers_license", "state_id", "passport"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(1, "ID Number is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  licenseImageUrl: z.string().url("Please upload your license"),
  idImageUrl: z.string().url("Please upload your ID"),
  vehicle: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().optional(),
    plate: z.string().min(1, "Plate number is required"),
    registrationImageUrl: z.string().url("Upload registration"),
    insuranceImageUrl: z.string().url("Upload insurance"),
    carImageUrl: z.string().url("Upload car photo"),
  }),
});

type ApplyFormValues = z.infer<typeof applySchema>;

const STEPS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "documents", label: "Documents", icon: FileCheck },
  { id: "review", label: "Review", icon: ShieldCheck },
];

export default function ApplyAgent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      idType: undefined,
      bio: "",
      vehicle: { make: "", model: "", plate: "" },
    },
  });

  const watchValues = watch();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(field);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("agent-docs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("agent-docs").getPublicUrl(filePath);
      setValue(field, data.publicUrl, { shouldValidate: true });
      
      toast({ title: "Upload successful", description: "Document added to your application." });
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Upload failed", 
        description: "Could not upload document. Check your connection.",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(null);
    }
  };

  const applyMutation = useMutation({
    mutationFn: (values: ApplyFormValues) => api.post("/api/me/apply-agent", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setCurrentStep(STEPS.length); // Final success step
      toast({ title: "Application Submitted", description: "We will review your documents shortly." });
    },
    onError: (err: any) => {
      toast({ 
        title: "Submission failed", 
        description: err.message || "Something went wrong.",
        variant: "destructive" 
      });
    },
  });

  const canGoNext = () => {
    if (currentStep === 0) return watchValues.idType && watchValues.idNumber && watchValues.bio;
    if (currentStep === 1) return watchValues.vehicle.make && watchValues.vehicle.model && watchValues.vehicle.plate;
    if (currentStep === 2) return (
      watchValues.licenseImageUrl && 
      watchValues.idImageUrl && 
      watchValues.vehicle.registrationImageUrl && 
      watchValues.vehicle.insuranceImageUrl &&
      watchValues.vehicle.carImageUrl
    );
    return true;
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo(0, 0);
    }
  };

  if (currentStep === STEPS.length) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 rounded-full bg-emerald-500/10 p-6 text-emerald-500"
        >
          <CheckCircle2 className="h-16 w-16" />
        </motion.div>
        <h1 className="mb-2 text-2xl font-bold">Application Received!</h1>
        <p className="mb-8 max-w-sm text-muted-foreground">
          Our team is now verifying your documents. This usually takes 24-48 hours. 
          You'll receive an email notification once you're approved.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="w-full max-w-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bricolage font-bold tracking-tight">Become an Agent</h1>
        <p className="mt-2 text-muted-foreground">Complete the vetting process to start taking jobs</p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12 flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.id} className="relative flex flex-1 flex-col items-center gap-2">
            {i !== 0 && (
              <div
                className={cn(
                  "absolute -left-1/2 top-4 h-0.5 w-full -translate-y-1/2 transition-colors",
                  i <= currentStep ? "bg-orange-500" : "bg-border"
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                i === currentStep
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : i < currentStep
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              <step.icon className="h-4 w-4" />
            </div>
            <span className={cn("text-xs font-medium", i === currentStep ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((v) => applyMutation.mutate(v))} className="space-y-8">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3 text-orange-200 text-sm">
                 <AlertCircle className="h-5 w-5 shrink-0 text-orange-400" />
                 <p>Your ID Number must match exactly with the documentation you upload later.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Identification Type</Label>
                  <Select 
                    onValueChange={(v) => setValue("idType", v as any, { shouldValidate: true })}
                    value={watchValues.idType}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="state_id">State ID Card</SelectItem>
                      <SelectItem value="passport">Intl. Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.idType && <p className="text-xs text-destructive">{errors.idType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">
                    {watchValues.idType === "passport" ? "Passport Number" : "ID Number"}
                  </Label>
                  <Input
                    id="idNumber"
                    placeholder={watchValues.idType === "passport" ? "e.g. A1234567" : "Enter government ID number"}
                    {...register("idNumber")}
                    className="h-12"
                  />
                  {errors.idNumber && <p className="text-xs text-destructive">{errors.idNumber.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your experience and why you'd like to be an agent..."
                  className="min-h-[150px] resize-none"
                  {...register("bio")}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Vehicle Make</Label>
                  <Input id="make" placeholder="e.g. Toyota" {...register("vehicle.make")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g. Camry" {...register("vehicle.model")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year (Optional)</Label>
                  <Input id="year" placeholder="2022" {...register("vehicle.year")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">License Plate</Label>
                  <Input id="plate" placeholder="ABC-1234" {...register("vehicle.plate")} />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
               <div className="space-y-3">
                  <Label>Driver's License (Photo)</Label>
                  <div className="relative group rounded-xl border-2 border-dashed border-border flex items-center justify-center h-40 overflow-hidden bg-muted/30">
                     {watchValues.licenseImageUrl ? (
                       <img src={watchValues.licenseImageUrl} className="h-full w-full object-cover" />
                     ) : (
                       <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                     )}
                     <input type="file" onChange={(e) => handleFileUpload(e, "licenseImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isUploading === "licenseImageUrl" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}
                  </div>
               </div>

               <div className="space-y-3">
                  <Label>ID Card / Passport (Photo)</Label>
                  <div className="relative group rounded-xl border-2 border-dashed border-border flex items-center justify-center h-40 overflow-hidden bg-muted/30">
                     {watchValues.idImageUrl ? (
                       <img src={watchValues.idImageUrl} className="h-full w-full object-cover" />
                     ) : (
                       <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                     )}
                     <input type="file" onChange={(e) => handleFileUpload(e, "idImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isUploading === "idImageUrl" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}
                  </div>
               </div>

               <div className="space-y-3">
                  <Label>Vehicle Registration</Label>
                  <div className="relative group rounded-xl border-2 border-dashed border-border flex items-center justify-center h-40 overflow-hidden bg-muted/30">
                     {watchValues.vehicle.registrationImageUrl ? (
                       <img src={watchValues.vehicle.registrationImageUrl} className="h-full w-full object-cover" />
                     ) : (
                       <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                     )}
                     <input type="file" onChange={(e) => handleFileUpload(e, "vehicle.registrationImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isUploading === "vehicle.registrationImageUrl" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}
                  </div>
               </div>

               <div className="space-y-3">
                  <Label>Proof of Insurance</Label>
                  <div className="relative group rounded-xl border-2 border-dashed border-border flex items-center justify-center h-40 overflow-hidden bg-muted/30">
                     {watchValues.vehicle.insuranceImageUrl ? (
                       <img src={watchValues.vehicle.insuranceImageUrl} className="h-full w-full object-cover" />
                     ) : (
                       <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                     )}
                     <input type="file" onChange={(e) => handleFileUpload(e, "vehicle.insuranceImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isUploading === "vehicle.insuranceImageUrl" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}
                  </div>
               </div>

               <div className="space-y-3 md:col-span-2">
                  <Label>Vehicle Photo (Front/Side View)</Label>
                  <div className="relative group rounded-xl border-2 border-dashed border-border flex items-center justify-center h-48 overflow-hidden bg-muted/30">
                     {watchValues.vehicle.carImageUrl ? (
                       <img src={watchValues.vehicle.carImageUrl} className="h-full w-full object-cover" />
                     ) : (
                       <div className="text-center group-hover:text-primary transition-colors">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Click to upload car photo</span>
                       </div>
                     )}
                     <input type="file" onChange={(e) => handleFileUpload(e, "vehicle.carImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isUploading === "vehicle.carImageUrl" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}
                  </div>
               </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm relative overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bricolage font-bold flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-orange-500" />
                       Review Application
                    </h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => setCurrentStep(0)}
                    >
                      <Pencil className="h-3 w-3" /> Edit All
                    </Button>
                 </div>

                 <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="relative group">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Identity</p>
                       <p className="font-medium capitalize">{watchValues.idType?.replace('_', ' ')}</p>
                       <p className="text-xs text-muted-foreground font-mono mt-1">#{watchValues.idNumber}</p>
                       <button onClick={() => setCurrentStep(0)} className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-primary"><Pencil className="h-3 w-3" /></button>
                    </div>
                    <div className="relative group">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Vehicle</p>
                       <p className="font-medium">{watchValues.vehicle.make} {watchValues.vehicle.model}</p>
                       <p className="text-xs text-muted-foreground mt-1">{watchValues.vehicle.plate}</p>
                       <button onClick={() => setCurrentStep(1)} className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-primary"><Pencil className="h-3 w-3" /></button>
                    </div>
                    <div className="col-span-2 relative group">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Personal Bio</p>
                       <p className="line-clamp-3 italic text-muted-foreground">"{watchValues.bio}"</p>
                       <button onClick={() => setCurrentStep(0)} className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-primary"><Pencil className="h-3 w-3" /></button>
                    </div>
                    <div className="col-span-2 relative group">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Documents Uploaded</p>
                       <div className="flex gap-2 mt-2">
                          {[
                            watchValues.licenseImageUrl, 
                            watchValues.idImageUrl, 
                            watchValues.vehicle.registrationImageUrl
                          ].map((url, i) => (
                            <div key={i} className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden">
                               <img src={url} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                             +2
                          </div>
                       </div>
                       <button onClick={() => setCurrentStep(2)} className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-primary"><Pencil className="h-3 w-3" /></button>
                    </div>
                 </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs">
                 <ShieldCheck className="h-5 w-5 text-orange-400 shrink-0" />
                 <p className="leading-relaxed opacity-80">
                    By submitting, you agree that all provided information is accurate. Falsification of documents will result in permanent suspension from the Get2U platform.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-6">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={prevStep} className="h-12 w-full max-w-[120px]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} disabled={!canGoNext()} className="h-12 flex-1">
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
               type="submit" 
               disabled={applyMutation.isPending} 
               onClick={() => {
                 // Manual error check helps find hidden validation failures
                 const formErrors = Object.keys(errors);
                 if (formErrors.length > 0) {
                    toast({
                      title: "Form incomplete",
                      description: "Please check all steps for missing information.",
                      variant: "destructive"
                    });
                 }
               }}
               className="h-12 flex-1 bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-orange-500/20 shadow-lg text-white font-bold"
            >
              {applyMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Submit Vetting Dossier
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
