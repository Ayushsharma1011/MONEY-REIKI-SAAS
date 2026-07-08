"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

type AuthContextValue = {
  session: Session | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  session = null
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session) }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
