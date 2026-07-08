export const experienceLevels = [
  "beginner",
  "intermediate",
  "advanced"
] as const;
export const practiceMinutes = [5, 10, 15, 20, 30, 45, 60] as const;
export const languages = ["english", "hindi", "hinglish"] as const;
export const reminderWindows = [
  "morning",
  "afternoon",
  "evening",
  "custom"
] as const;

export type ExperienceLevel = (typeof experienceLevels)[number];
export type PracticeMinutes = (typeof practiceMinutes)[number];
export type PreferredLanguage = (typeof languages)[number];
export type ReminderWindow = (typeof reminderWindows)[number];

export type OnboardingFormData = {
  fullName: string;
  bio: string;
  experienceLevel: ExperienceLevel;
  avatarFile: File | null;
  primaryGoals: string[];
  practiceMinutes: PracticeMinutes;
  reminderWindow: ReminderWindow;
  reminderTime: string;
  preferredLanguage: PreferredLanguage;
  pushNotifications: boolean;
  emailNotifications: boolean;
  dailyReminderEnabled: boolean;
};

export type OnboardingStepId =
  | "welcome"
  | "profile"
  | "goal"
  | "practice"
  | "reminder"
  | "language"
  | "notifications"
  | "generating";
