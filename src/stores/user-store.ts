import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/features/auth/types";

type AuthStatus = "loading" | "authenticated" | "guest";

type UserStore = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  status: AuthStatus;
  error: string | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  session: null,
  user: null,
  profile: null,
  status: "loading",
  error: null,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? "authenticated" : "guest"
    }),
  setProfile: (profile) => set({ profile }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  reset: () =>
    set({
      session: null,
      user: null,
      profile: null,
      status: "guest",
      error: null
    })
}));
