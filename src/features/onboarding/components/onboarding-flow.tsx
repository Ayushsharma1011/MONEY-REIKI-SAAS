"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  Loader2,
  Sparkles,
  Target,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/app";
import {
  experienceOptions,
  generationMessages,
  languageOptions,
  onboardingSteps,
  practiceOptions,
  primaryGoalOptions,
  reminderOptions
} from "@/features/onboarding/constants";
import { completeOnboarding } from "@/features/onboarding/service";
import type {
  OnboardingFormData,
  PreferredLanguage,
  PracticeMinutes
} from "@/features/onboarding/types";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const LAST_INPUT_STEP = 6;
const MAX_AVATAR_BYTES = 2_000_000;

type OnboardingFlowProps = {
  initialName?: string;
};

export function OnboardingFlow({ initialName = "" }: OnboardingFlowProps) {
  const router = useRouter();
  const { currentStep, draft, markCompleted, setCurrentStep, updateDraft } =
    useOnboardingStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generationIndex, setGenerationIndex] = useState(0);

  const form: OnboardingFormData = useMemo(
    () => ({
      ...draft,
      fullName: draft.fullName || initialName,
      avatarFile
    }),
    [avatarFile, draft, initialName]
  );

  const progress = Math.round(
    ((currentStep + 1) / onboardingSteps.length) * 100
  );
  const activeStep = onboardingSteps[currentStep];

  useEffect(() => {
    if (currentStep !== 7) {
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationIndex((value) =>
        value >= generationMessages.length - 1 ? value : value + 1
      );
    }, 1100);

    return () => window.clearInterval(interval);
  }, [currentStep]);

  function validateStep(step: number) {
    if (step === 1 && form.fullName.trim().length < 2) {
      return "Enter your full name to personalize the journey.";
    }

    if (step === 2 && form.primaryGoals.length === 0) {
      return "Choose at least one goal.";
    }

    if (step === 4 && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.reminderTime)) {
      return "Choose a valid reminder time.";
    }

    return null;
  }

  function next() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setCurrentStep(Math.min(currentStep + 1, LAST_INPUT_STEP));
  }

  function back() {
    setError(null);
    setCurrentStep(Math.max(currentStep - 1, 0));
  }

  function update<K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K]
  ) {
    updateDraft({ [key]: value });
  }

  function toggleGoal(goal: string) {
    const selected = form.primaryGoals.includes(goal);
    update(
      "primaryGoals",
      selected
        ? form.primaryGoals.filter((item) => item !== goal)
        : [...form.primaryGoals, goal]
    );
  }

  function onAvatarChange(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for your profile picture.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setError("Profile picture must be smaller than 2 MB.");
      return;
    }

    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    const permission = await window.Notification.requestPermission();
    update("pushNotifications", permission === "granted");
  }

  async function finish() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setCurrentStep(7);
    setGenerationIndex(0);

    const minimumDelay = new Promise((resolve) =>
      window.setTimeout(resolve, 6200)
    );
    const [result] = await Promise.all([
      completeOnboarding(form),
      minimumDelay
    ]);

    if (result.error) {
      setSaving(false);
      setCurrentStep(LAST_INPUT_STEP);
      toast.error(result.error);
      setError(result.error);
      return;
    }

    markCompleted();
    toast.success("Your journey is ready.");
    router.replace(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <main className="bg-background relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--accent)/0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgb(var(--primary)/0.16),transparent_28%),linear-gradient(135deg,rgb(var(--background)),rgb(var(--secondary)))]" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-accent text-sm font-medium">Money Reiki OS</p>
            <p className="text-muted-foreground text-xs">{activeStep?.label}</p>
          </div>
          <div className="w-40">
            <Progress value={progress} />
          </div>
        </div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <StepRail currentStep={currentStep} />
          <section className="bg-card/82 shadow-primary/10 rounded-lg border p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {currentStep === 0 ? <WelcomeStep /> : null}
              {currentStep === 1 ? (
                <ProfileStep
                  form={form}
                  avatarPreview={avatarPreview}
                  onAvatarChange={onAvatarChange}
                  update={update}
                />
              ) : null}
              {currentStep === 2 ? (
                <GoalStep
                  selected={form.primaryGoals}
                  toggleGoal={toggleGoal}
                />
              ) : null}
              {currentStep === 3 ? (
                <PracticeStep
                  value={form.practiceMinutes}
                  update={(value) => update("practiceMinutes", value)}
                />
              ) : null}
              {currentStep === 4 ? (
                <ReminderStep form={form} update={update} />
              ) : null}
              {currentStep === 5 ? (
                <LanguageStep
                  value={form.preferredLanguage}
                  update={(value) => update("preferredLanguage", value)}
                />
              ) : null}
              {currentStep === 6 ? (
                <NotificationStep
                  form={form}
                  update={update}
                  requestPermission={requestNotificationPermission}
                />
              ) : null}
              {currentStep === 7 ? (
                <GeneratingStep message={generationMessages[generationIndex]} />
              ) : null}
            </motion.div>

            {error ? (
              <p className="border-destructive/30 bg-destructive/10 text-destructive mt-6 rounded-md border p-3 text-sm">
                {error}
              </p>
            ) : null}

            {currentStep < 7 ? (
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={back}
                  disabled={currentStep === 0 || saving}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={currentStep === LAST_INPUT_STEP ? finish : next}
                >
                  {currentStep === LAST_INPUT_STEP ? "Finish" : "Continue"}
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function StepRail({ currentStep }: { currentStep: number }) {
  return (
    <aside className="hidden lg:block">
      <div className="space-y-4">
        {onboardingSteps.slice(0, 7).map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-sm font-medium",
                index <= currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="size-4" aria-hidden />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(index === currentStep && "font-medium")}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function WelcomeStep() {
  return (
    <div className="py-8 text-center">
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="bg-primary text-primary-foreground shadow-primary/20 mx-auto mb-8 flex size-20 items-center justify-center rounded-full shadow-xl"
      >
        <Sparkles className="size-9" aria-hidden />
      </motion.div>
      <h1 className="font-serif text-4xl font-semibold sm:text-6xl">
        Welcome to Money Reiki OS
      </h1>
      <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg">
        Your journey towards a consistent Money Reiki practice begins today.
      </p>
    </div>
  );
}

function ProfileStep({
  form,
  avatarPreview,
  onAvatarChange,
  update
}: {
  form: OnboardingFormData;
  avatarPreview: string | null;
  onAvatarChange: (file: File | undefined) => void;
  update: <K extends keyof Omit<OnboardingFormData, "avatarFile">>(
    key: K,
    value: Omit<OnboardingFormData, "avatarFile">[K]
  ) => void;
}) {
  return (
    <div>
      <StepTitle
        icon={UserRound}
        title="Tell us about you"
        subtitle="A personal practice starts with a human profile."
      />
      <div className="mt-6 grid gap-5">
        <label className="bg-background/60 flex cursor-pointer items-center gap-4 rounded-lg border p-4">
          <div className="bg-muted flex size-16 items-center justify-center overflow-hidden rounded-full">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Camera className="text-muted-foreground size-6" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-medium">Profile picture</p>
            <p className="text-muted-foreground text-sm">
              PNG or JPG under 2 MB.
            </p>
          </div>
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => onAvatarChange(event.target.files?.[0])}
          />
        </label>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="fullName">
            Full name
          </label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="bio">
            Short bio
          </label>
          <textarea
            id="bio"
            className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            value={form.bio}
            maxLength={240}
            onChange={(event) => update("bio", event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {experienceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "bg-background/60 hover:border-primary rounded-lg border p-4 text-left transition",
                form.experienceLevel === option.value &&
                  "border-primary bg-primary/10"
              )}
              onClick={() => update("experienceLevel", option.value)}
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-muted-foreground mt-2 block text-sm">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalStep({
  selected,
  toggleGoal
}: {
  selected: string[];
  toggleGoal: (goal: string) => void;
}) {
  return (
    <div>
      <StepTitle
        icon={Target}
        title="Choose your primary goals"
        subtitle="Select the intentions that feel alive for you right now."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {primaryGoalOptions.map((goal) => {
          const active = selected.includes(goal);
          return (
            <motion.button
              key={goal}
              whileHover={{ y: -2 }}
              type="button"
              className={cn(
                "bg-background/60 rounded-lg border p-4 text-left transition",
                active && "border-primary bg-primary/10"
              )}
              onClick={() => toggleGoal(goal)}
            >
              <span className="flex items-center justify-between gap-3 font-medium">
                {goal}
                {active ? (
                  <Check className="text-primary size-4" aria-hidden />
                ) : null}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PracticeStep({
  value,
  update
}: {
  value: PracticeMinutes;
  update: (value: PracticeMinutes) => void;
}) {
  return (
    <div>
      <StepTitle
        icon={Clock}
        title="Set your daily practice rhythm"
        subtitle="Choose a duration that feels sustainable, not heroic."
      />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {practiceOptions.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={cn(
              "bg-background/60 hover:border-primary rounded-lg border p-5 text-center transition",
              value === minutes && "border-primary bg-primary/10"
            )}
            onClick={() => update(minutes)}
          >
            <span className="text-2xl font-semibold">{minutes}</span>
            <span className="text-muted-foreground block text-sm">Minutes</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReminderStep({
  form,
  update
}: {
  form: OnboardingFormData;
  update: <K extends keyof Omit<OnboardingFormData, "avatarFile">>(
    key: K,
    value: Omit<OnboardingFormData, "avatarFile">[K]
  ) => void;
}) {
  return (
    <div>
      <StepTitle
        icon={Bell}
        title="Choose your reminder time"
        subtitle="A gentle reminder helps your practice become part of the day."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {reminderOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "bg-background/60 hover:border-primary rounded-lg border p-4 text-left transition",
              form.reminderWindow === option.value &&
                "border-primary bg-primary/10"
            )}
            onClick={() => {
              update("reminderWindow", option.value);
              update("reminderTime", option.time);
            }}
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-muted-foreground mt-1 block text-sm">
              {option.time}
            </span>
          </button>
        ))}
      </div>
      {form.reminderWindow === "custom" ? (
        <div className="mt-5">
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="reminderTime"
          >
            Custom time
          </label>
          <Input
            id="reminderTime"
            type="time"
            value={form.reminderTime}
            onChange={(event) => update("reminderTime", event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}

function LanguageStep({
  value,
  update
}: {
  value: PreferredLanguage;
  update: (value: PreferredLanguage) => void;
}) {
  return (
    <div>
      <StepTitle
        icon={Globe2}
        title="Choose your language"
        subtitle="The platform is prepared for a multilingual Money Reiki journey."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {languageOptions.map((language) => (
          <button
            key={language.value}
            type="button"
            className={cn(
              "bg-background/60 hover:border-primary rounded-lg border p-5 text-center text-lg font-medium transition",
              value === language.value && "border-primary bg-primary/10"
            )}
            onClick={() => update(language.value)}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationStep({
  form,
  update,
  requestPermission
}: {
  form: OnboardingFormData;
  update: <K extends keyof Omit<OnboardingFormData, "avatarFile">>(
    key: K,
    value: Omit<OnboardingFormData, "avatarFile">[K]
  ) => void;
  requestPermission: () => Promise<void>;
}) {
  return (
    <div>
      <StepTitle
        icon={Bell}
        title="Keep the practice close"
        subtitle="Reminders are not noise here. They are a quiet invitation back to yourself."
      />
      <div className="mt-6 space-y-3">
        <ToggleRow
          label="Daily reminder"
          checked={form.dailyReminderEnabled}
          onChange={(checked) => update("dailyReminderEnabled", checked)}
        />
        <ToggleRow
          label="Email notifications"
          checked={form.emailNotifications}
          onChange={(checked) => update("emailNotifications", checked)}
        />
        <ToggleRow
          label="Push notifications"
          checked={form.pushNotifications}
          onChange={(checked) => update("pushNotifications", checked)}
        />
      </div>
      <Button
        className="mt-5"
        type="button"
        variant="outline"
        onClick={requestPermission}
      >
        Ask browser permission
      </Button>
    </div>
  );
}

function GeneratingStep({ message }: { message?: string }) {
  return (
    <div className="py-10 text-center" aria-live="polite">
      <div className="relative mx-auto mb-8 flex size-28 items-center justify-center">
        <motion.div
          className="border-accent absolute inset-0 rounded-full border-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <Loader2 className="text-primary size-10 animate-spin" aria-hidden />
      </div>
      <h2 className="text-3xl font-semibold">
        Generating your personal journey
      </h2>
      <p className="text-muted-foreground mt-4 text-lg">{message}</p>
    </div>
  );
}

function StepTitle({
  icon: Icon,
  title,
  subtitle
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-md">
        <Icon className="size-5" aria-hidden />
      </div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="bg-background/60 flex items-center justify-between gap-4 rounded-lg border p-4">
      <span className="font-medium">{label}</span>
      <input
        className="accent-primary size-5"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
