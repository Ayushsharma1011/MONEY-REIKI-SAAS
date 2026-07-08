import type { Metadata } from "next";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Onboarding"
};

export default async function OnboardingPage() {
  let initialName = "";

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    initialName = user?.user_metadata.full_name ?? "";
  } catch {
    initialName = "";
  }

  return <OnboardingFlow initialName={initialName} />;
}
