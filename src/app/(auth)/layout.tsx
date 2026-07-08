import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME, ROUTES } from "@/constants/app";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-dvh">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link className="font-semibold" href={ROUTES.home}>
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center px-4">
        {children}
      </main>
    </div>
  );
}
