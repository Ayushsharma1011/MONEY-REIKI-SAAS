import { z } from "zod";
import {
  experienceLevels,
  languages,
  practiceMinutes,
  reminderWindows
} from "@/features/onboarding/types";

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  bio: z
    .string()
    .trim()
    .max(240, "Bio must be 240 characters or less.")
    .optional(),
  experienceLevel: z.enum(experienceLevels),
  primaryGoals: z.array(z.string()).min(1, "Choose at least one goal.").max(5),
  practiceMinutes: z.enum(practiceMinutes.map(String) as [string, ...string[]]),
  reminderWindow: z.enum(reminderWindows),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time."),
  preferredLanguage: z.enum(languages),
  pushNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  dailyReminderEnabled: z.boolean()
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
