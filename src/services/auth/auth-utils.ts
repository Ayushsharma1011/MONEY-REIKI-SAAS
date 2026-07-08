import type { Session, User } from "@supabase/supabase-js";

export function getUserFromSession(session: Session | null): User | null {
  return session?.user ?? null;
}

export function isSessionActive(session: Session | null) {
  return Boolean(session?.access_token);
}
