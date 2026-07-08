"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loader } from "@/components/ui/loader";
import { ROUTES } from "@/constants/app";
import { useAuth } from "@/providers/auth-provider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.auth);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <Loader label="Preparing secure session" />;
  }

  return children;
}
