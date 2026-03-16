import { useState } from "react";
import { cn } from "@/lib/utils";

interface CheckCardProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckCard({ label, checked, onChange }: CheckCardProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "rounded-xl border-2 px-3 py-2 text-center text-xs font-medium transition-all",
        checked
          ? "border-[hsl(24_95%_48%)] bg-orange-50 text-[hsl(24_95%_48%)]"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
      )}
    >
      {label}
    </button>
  );
}

interface RadioCardsProps {
  options: { value: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
}

export function RadioCards({ options, value, onChange }: RadioCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border-2 px-2 py-3 text-center transition-all",
            value === opt.value
              ? "border-[hsl(24_95%_48%)] bg-orange-50 text-[hsl(24_95%_48%)]"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          )}
        >
          <div className="text-xs font-semibold">{opt.label}</div>
          {opt.sub ? <div className="mt-0.5 text-[10px] opacity-70">{opt.sub}</div> : null}
        </button>
      ))}
    </div>
  );
}

// Issue type multi-check for vehicle_help
const ISSUE_TYPES = ["Flat Tyre", "Battery Jump-start", "Locked Out", "Overheating", "Other"];

interface IssueChecksProps {
  value: string[];
  onChange: (v: string[]) => void;
}

export function IssueChecks({ value, onChange }: IssueChecksProps) {
  const toggle = (issue: string) => {
    onChange(value.includes(issue) ? value.filter((i) => i !== issue) : [...value, issue]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {ISSUE_TYPES.map((issue) => (
        <CheckCard key={issue} label={issue} checked={value.includes(issue)} onChange={() => toggle(issue)} />
      ))}
    </div>
  );
}

// Suppress unused warning
void useState;
