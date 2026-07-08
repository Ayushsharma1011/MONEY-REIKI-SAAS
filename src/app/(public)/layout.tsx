import type { ReactNode } from "react";
import { Footer } from "@/components/navigation/footer";
import { TopNavbar } from "@/components/navigation/top-navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <TopNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
