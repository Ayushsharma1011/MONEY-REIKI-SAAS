import { AlertCircle } from "lucide-react";
import { type ReactNode } from "react";

export function Alert({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-card flex gap-3 rounded-lg border p-4 text-sm">
      <AlertCircle className="text-accent mt-0.5 size-4" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        <div className="text-muted-foreground mt-1">{children}</div>
      </div>
    </div>
  );
}
