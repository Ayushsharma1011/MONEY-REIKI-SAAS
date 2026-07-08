import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("text-primary size-5 animate-spin", className)}
      aria-label="Loading"
    />
  );
}

export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-3">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}
