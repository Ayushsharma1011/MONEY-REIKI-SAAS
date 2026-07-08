import { Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell({
  count,
  href = "#notifications",
  className
}: {
  count: number;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      className={cn(
        "bg-card/80 hover:bg-muted relative inline-flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors",
        className
      )}
      href={href}
    >
      <Bell className="size-4" aria-hidden />
      {count > 0 ? (
        <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
