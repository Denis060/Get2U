import { STATUS_COLORS } from "@/types/orders";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = STATUS_COLORS[status] ?? { bg: "bg-muted", text: "text-muted-foreground", label: status };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium capitalize",
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
