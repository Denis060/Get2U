import { cn } from "@/lib/utils";

export type PriorityOption = "standard" | "express" | "urgent";

const PRIORITIES: { value: PriorityOption; label: string; sub: string; accent: string }[] = [
  { value: "standard", label: "Standard", sub: "2–4 hrs", accent: "border-gray-200 hover:border-gray-300" },
  { value: "express", label: "Express", sub: "1–2 hrs", accent: "border-orange-300 hover:border-orange-400" },
  { value: "urgent", label: "Urgent", sub: "ASAP", accent: "border-red-300 hover:border-red-400" },
];

interface PriorityCardsProps {
  value: PriorityOption;
  onChange: (v: PriorityOption) => void;
}

export function PriorityCards({ value, onChange }: PriorityCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-xl border-2 px-2 py-3 text-center transition-all",
            value === p.value
              ? p.value === "urgent"
                ? "border-red-500 bg-red-50 text-red-700"
                : p.value === "express"
                ? "border-[hsl(24_95%_48%)] bg-orange-50 text-[hsl(24_95%_48%)]"
                : "border-gray-400 bg-gray-50 text-gray-700"
              : p.accent + " bg-white text-gray-500"
          )}
        >
          <div className="text-xs font-semibold">{p.label}</div>
          <div className="mt-0.5 text-[10px] opacity-70">{p.sub}</div>
        </button>
      ))}
    </div>
  );
}

type PackageOption = "letter" | "small_package" | "large_package";
const PACKAGE_TYPES: { value: PackageOption; label: string; sub: string }[] = [
  { value: "letter", label: "Letter", sub: "Docs & envelopes" },
  { value: "small_package", label: "Small", sub: "Up to 5 kg" },
  { value: "large_package", label: "Large", sub: "5–20 kg" },
];

interface PackageCardsProps {
  value: PackageOption | "";
  onChange: (v: PackageOption) => void;
}

export function PackageCards({ value, onChange }: PackageCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PACKAGE_TYPES.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-xl border-2 px-2 py-3 text-center transition-all",
            value === p.value
              ? "border-[hsl(24_95%_48%)] bg-orange-50 text-[hsl(24_95%_48%)]"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          )}
        >
          <div className="text-xs font-semibold">{p.label}</div>
          <div className="mt-0.5 text-[10px] opacity-70">{p.sub}</div>
        </button>
      ))}
    </div>
  );
}
