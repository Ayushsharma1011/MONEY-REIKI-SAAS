import { Inbox } from "lucide-react";
import { type ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-card flex min-h-56 flex-col items-center justify-center rounded-lg border p-8 text-center">
      <Inbox className="text-accent mb-3 size-8" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
