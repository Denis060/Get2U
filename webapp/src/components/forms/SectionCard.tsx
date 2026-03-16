import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-4 shadow-sm", className)}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(24_95%_48%)]">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, error, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
