import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingFormData } from "@/features/onboarding/types";

type PersistedOnboardingDraft = Omit<OnboardingFormData, "avatarFile">;

type OnboardingStore = {
  currentStep: number;
  completed: boolean;
  draft: PersistedOnboardingDraft;
  setCurrentStep: (step: number) => void;
  updateDraft: (draft: Partial<PersistedOnboardingDraft>) => void;
  markCompleted: () => void;
  reset: () => void;
};

const initialDraft: PersistedOnboardingDraft = {
  fullName: "",
  bio: "",
  experienceLevel: "beginner",
  primaryGoals: [],
  practiceMinutes: 10,
  reminderWindow: "morning",
  reminderTime: "07:30",
  preferredLanguage: "english",
  pushNotifications: false,
  emailNotifications: true,
  dailyReminderEnabled: true
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      completed: false,
      draft: initialDraft,
      setCurrentStep: (currentStep) => set({ currentStep }),
      updateDraft: (draft) =>
        set((state) => ({ draft: { ...state.draft, ...draft } })),
      markCompleted: () => set({ completed: true, currentStep: 7 }),
      reset: () =>
        set({ currentStep: 0, completed: false, draft: initialDraft })
    }),
    {
      name: "money-reiki-onboarding"
    }
  )
);
