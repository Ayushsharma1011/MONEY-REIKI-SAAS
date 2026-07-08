import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  className
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card/80 rounded-xl border p-4 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
