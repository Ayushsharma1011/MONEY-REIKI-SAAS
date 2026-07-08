import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items
}: {
  items: { title: string; href: string }[];
}) {
  return (
    <nav
      className="text-muted-foreground flex items-center gap-2 text-sm"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="size-3" aria-hidden /> : null}
          <Link className="hover:text-foreground" href={item.href}>
            {item.title}
          </Link>
        </span>
      ))}
    </nav>
  );
}
