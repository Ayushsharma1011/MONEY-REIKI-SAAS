import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopNavbar() {
  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="font-semibold tracking-normal" href={ROUTES.home}>
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
