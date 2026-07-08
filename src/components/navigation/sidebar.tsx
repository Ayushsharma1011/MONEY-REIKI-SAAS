import Link from "next/link";
import { dashboardNavItems } from "@/components/navigation/nav-items";
import { APP_NAME } from "@/constants/app";

export function Sidebar() {
  return (
    <aside className="bg-card/70 hidden min-h-dvh w-72 border-r p-5 lg:block">
      <p className="mb-8 font-semibold">{APP_NAME}</p>
      <nav className="space-y-1" aria-label="Dashboard">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
              href={item.href}
            >
              {Icon ? <Icon className="size-4" aria-hidden /> : null}
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
