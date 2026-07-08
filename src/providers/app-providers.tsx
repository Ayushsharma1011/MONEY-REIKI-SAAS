"use client";

import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </QueryProvider>
    </ThemeProvider>
  );
}
