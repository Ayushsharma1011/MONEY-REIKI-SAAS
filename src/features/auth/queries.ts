import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/features/auth/types";

export async function getCurrentProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,avatar_url,bio,experience_level,onboarding_completed,primary_goal,role,created_at,updated_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as Profile | null;
}
