import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Image as ImageIcon, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface InspectionUploadProps {
  type: "pickup" | "dropoff";
  onComplete: (photos: string[], notes: string) => void;
  isLoading?: boolean;
}

export default function InspectionUpload({ type, onComplete, isLoading }: InspectionUploadProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (photos.length + files.length > 4) {
      toast({ title: "Limit reached", description: "You can upload up to 4 photos per inspection.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `inspections/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("agent-docs") // Reusing the existing bucket for simplicity, or create a new one 'inspections'
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("agent-docs").getPublicUrl(filePath);
        return data.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...urls]);
      toast({ title: "Upload successful", description: `${urls.length} photo(s) added.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Upload failed", description: "Could not upload photos. Try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const label = type === "pickup" ? "Pickup Condition Proof" : "Drop-off Condition Proof";
  const description = type === "pickup" 
    ? "Document the item's condition before you take possession (check for scratches, dents, etc)." 
    : "Document the final condition and placement of the item at delivery.";

  return (
    <div className="space-y-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-orange-500/10 p-1.5 text-orange-500">
           <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-orange-200">{label}</h3>
          <p className="mt-0.5 text-xs text-orange-200/60 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {photos.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border/50">
            <img src={url} className="h-full w-full object-cover" />
            <button 
              onClick={() => removePhoto(url)} 
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white backdrop-blur-md"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photos.length < 4 && (
          <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-500/30 bg-background/40 transition-all hover:bg-orange-500/10 hover:border-orange-500/50">
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-orange-500" /> : <Camera className="h-5 w-5 text-orange-400" />}
            <span className="mt-1 text-[10px] font-medium text-orange-400">Add Photo</span>
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-orange-200/60">Condition Notes (Optional)</Label>
        <Textarea 
          placeholder="Note any existing scratches or special placement details..." 
          className="min-h-[80px] bg-background/50 border-orange-500/20 text-sm focus:border-orange-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button 
        onClick={() => onComplete(photos, notes)} 
        disabled={photos.length === 0 || isLoading || isUploading}
        className="w-full bg-orange-500 font-bold text-black hover:bg-orange-400 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
        Confirm Inspection
      </Button>
    </div>
  );
}
