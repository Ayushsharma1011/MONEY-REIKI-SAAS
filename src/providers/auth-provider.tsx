"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/features/auth/queries";
import type { Profile } from "@/features/auth/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/user-store";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  session: initialSession = null
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  const {
    profile,
    session,
    setError,
    setProfile,
    setSession,
    setStatus,
    status,
    user
  } = useUserStore();

  const hydrateProfile = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user.id) {
        setProfile(null);
        return;
      }

      const nextProfile = await getCurrentProfile(currentSession.user.id);
      setProfile(nextProfile);
    },
    [setProfile]
  );

  const refreshSession = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      setSession(data.session);
      await hydrateProfile(data.session);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to refresh session."
      );
      setStatus("guest");
    }
  }, [hydrateProfile, setError, setSession, setStatus]);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = createSupabaseBrowserClient();

      supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted) {
          return;
        }

        setSession(data.session);
        await hydrateProfile(data.session);
      });

      const { data } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          setSession(nextSession);
          void hydrateProfile(nextSession);
        }
      );

      return () => {
        mounted = false;
        data.subscription.unsubscribe();
      };
    } catch {
      setSession(initialSession);
      setStatus(initialSession ? "authenticated" : "guest");
    }
  }, [hydrateProfile, initialSession, setSession, setStatus]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading: status === "loading",
      isAuthenticated: Boolean(session),
      refreshSession
    }),
    [profile, refreshSession, session, status, user]
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
