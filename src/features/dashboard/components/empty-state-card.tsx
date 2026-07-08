import { Inbox } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  onAction,
  className
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card/70 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <Inbox className="text-accent mb-3 size-7" aria-hidden />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">{description}</p>
      {actionLabel ? (
        <Button className="mt-4" size="sm" onClick={onAction} type="button">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorStateCard({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyStateCard
      title={title}
      description={description}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}

export function SectionShell({
  title,
  children,
  action
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="text-sm font-semibold tracking-wide uppercase"
          id={title.replace(/\s+/g, "-").toLowerCase()}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
