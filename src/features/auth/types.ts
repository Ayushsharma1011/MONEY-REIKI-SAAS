import type { Session, User } from "@supabase/supabase-js";

export const userRoles = ["student", "admin", "super_admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  status: "loading" | "authenticated" | "guest";
  error: string | null;
};

export type PasswordStrengthLabel =
  "Very Weak" | "Weak" | "Medium" | "Strong" | "Excellent";

export type PasswordRule = {
  id: string;
  label: string;
  valid: boolean;
};
