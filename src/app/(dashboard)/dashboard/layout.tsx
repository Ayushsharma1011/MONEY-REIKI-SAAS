import type { ReactNode } from "react";
import { BottomNavigation } from "@/features/dashboard/components/bottom-navigation";
import { Sidebar } from "@/components/navigation/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-28 sm:p-6 lg:pb-6">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
