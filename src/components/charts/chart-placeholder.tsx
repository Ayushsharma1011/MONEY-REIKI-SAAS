import { BarChart3 } from "lucide-react";

export function ChartPlaceholder() {
  return (
    <div className="bg-card text-muted-foreground flex min-h-56 flex-col items-center justify-center rounded-lg border">
      <BarChart3 className="text-accent mb-3 size-8" aria-hidden />
      <p className="text-sm font-medium">Chart placeholder</p>
    </div>
  );
}
