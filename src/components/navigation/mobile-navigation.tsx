import Link from "next/link";
import { dashboardNavItems } from "@/components/navigation/nav-items";

export function MobileNavigation() {
  return (
    <nav
      className="bg-background/90 fixed inset-x-0 bottom-0 z-40 flex justify-around border-t p-2 backdrop-blur lg:hidden"
      aria-label="Mobile"
    >
      {dashboardNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            className="text-muted-foreground flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs"
            href={item.href}
          >
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
