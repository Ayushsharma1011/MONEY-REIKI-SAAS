import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME, ROUTES } from "@/constants/app";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(var(--accent)/0.18),transparent_32%),linear-gradient(135deg,rgb(var(--background)),rgb(var(--secondary)))]" />
      <header className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-6">
        <Link className="font-semibold" href={ROUTES.home}>
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
