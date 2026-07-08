"use client";

import { z } from "zod";
import { onboardingSchema } from "@/features/onboarding/schema";
import type { OnboardingFormData } from "@/features/onboarding/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

async function uploadAvatar(userId: string, file: File | null) {
  if (!file) {
    return null;
  }

  const supabase = createSupabaseBrowserClient();
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${userId}/profile-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) {
    throw new Error("Profile picture could not be uploaded.");
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function completeOnboarding(input: OnboardingFormData) {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Please sign in again to finish onboarding.");
    }

    const parsed = onboardingSchema.parse({
      ...input,
      practiceMinutes: String(input.practiceMinutes)
    });

    const avatarUrl = await uploadAvatar(user.id, input.avatarFile);
    const timezone = getTimezone();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.fullName,
        bio: parsed.bio ?? "",
        avatar_url: avatarUrl,
        experience_level: parsed.experienceLevel,
        primary_goal: parsed.primaryGoals,
        onboarding_completed: true
      })
      .eq("id", user.id);

    if (profileError) {
      throw new Error("Your profile could not be saved.");
    }

    const { error: settingsError } = await supabase
      .from("user_settings")
      .update({
        practice_minutes: Number(parsed.practiceMinutes),
        preferred_language: parsed.preferredLanguage,
        daily_reminder_time: parsed.reminderTime,
        timezone
      })
      .eq("user_id", user.id);

    if (settingsError) {
      throw new Error("Your preferences could not be saved.");
    }

    const { error: notificationError } = await supabase
      .from("notification_preferences")
      .update({
        push_notifications: parsed.pushNotifications,
        email_notifications: parsed.emailNotifications,
        daily_reminder_enabled: parsed.dailyReminderEnabled
      })
      .eq("user_id", user.id);

    if (notificationError) {
      throw new Error("Notification preferences could not be saved.");
    }

    const { error: progressError } = await supabase
      .from("user_progress")
      .update({
        meditation_minutes: 0,
        journal_entries: 0,
        streak: 0,
        last_login: new Date().toISOString(),
        default_daily_practice: {
          minutes: Number(parsed.practiceMinutes),
          reminderTime: parsed.reminderTime
        },
        dashboard_state: {
          firstVisit: true,
          activeModule: null
        },
        ai_journey_placeholder: {
          status: "prepared",
          generatedAt: new Date().toISOString()
        }
      })
      .eq("user_id", user.id);

    if (progressError) {
      throw new Error("Your journey setup could not be completed.");
    }

    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0]?.message ?? "Check your onboarding details."
      };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Onboarding could not be completed. Please try again."
    };
  }
}
