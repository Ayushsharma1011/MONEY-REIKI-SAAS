import type {
  ExperienceLevel,
  OnboardingStepId,
  PreferredLanguage,
  PracticeMinutes,
  ReminderWindow
} from "@/features/onboarding/types";

export const onboardingSteps: { id: OnboardingStepId; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Profile" },
  { id: "goal", label: "Goal" },
  { id: "practice", label: "Practice" },
  { id: "reminder", label: "Reminder" },
  { id: "language", label: "Language" },
  { id: "notifications", label: "Notifications" },
  { id: "generating", label: "Journey" }
];

export const experienceOptions: {
  value: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "I am just starting my Money Reiki practice."
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "I have practiced before and want consistency."
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "I am deepening an existing spiritual practice."
  }
];

export const primaryGoalOptions = [
  "Improve Money Mindset",
  "Build Daily Practice",
  "Stay Consistent",
  "Reduce Financial Stress",
  "Increase Confidence",
  "Complete the Course",
  "Grow Personally"
];

export const practiceOptions: PracticeMinutes[] = [5, 10, 15, 20, 30, 45, 60];

export const reminderOptions: {
  value: ReminderWindow;
  label: string;
  time: string;
}[] = [
  { value: "morning", label: "Morning", time: "07:30" },
  { value: "afternoon", label: "Afternoon", time: "13:00" },
  { value: "evening", label: "Evening", time: "19:30" },
  { value: "custom", label: "Custom", time: "08:00" }
];

export const languageOptions: { value: PreferredLanguage; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" }
];

export const generationMessages = [
  "Creating your profile...",
  "Preparing your journey...",
  "Setting up your daily practice...",
  "Preparing your first affirmation...",
  "Almost ready..."
];
