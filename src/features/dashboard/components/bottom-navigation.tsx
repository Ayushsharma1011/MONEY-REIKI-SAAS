"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { STUDENT_NAV_ITEMS } from "@/features/dashboard/constants";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Student navigation"
      className="bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {STUDENT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

          return (
            <Link
              key={item.title}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-all",
                isActive
                  ? "bg-primary/10 text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={item.href}
            >
              <Icon className="size-4" aria-hidden />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
