import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/85 sticky top-0 z-30 flex h-16 items-center justify-end border-b px-4 backdrop-blur sm:px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
        <MobileNavigation />
      </div>
    </div>
  );
}
