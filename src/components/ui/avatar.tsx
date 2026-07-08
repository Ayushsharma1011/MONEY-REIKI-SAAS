import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  className
}: {
  name?: string;
  className?: string;
}) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-full text-sm font-semibold",
        className
      )}
      aria-label={name ?? "User avatar"}
    >
      {initials || <User className="size-4" aria-hidden />}
    </div>
  );
}
