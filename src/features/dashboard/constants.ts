import {
  BookOpen,
  Brain,
  GraduationCap,
  Heart,
  Home,
  NotebookPen,
  Sparkles,
  UserRound,
  type LucideIcon
} from "lucide-react";
import { ROUTES } from "@/constants/app";

export const DASHBOARD_QUERY_KEY = "dashboard";

export const DAILY_QUOTES = [
  "Every step you take today creates abundance tomorrow.",
  "Your energy attracts your reality. Choose abundance.",
  "Small daily rituals create extraordinary financial freedom.",
  "You are worthy of wealth, peace, and prosperity."
] as const;

export const JOURNAL_PROMPTS = [
  "What financial abundance did you notice today?",
  "Where did you feel gratitude for money flowing to you?",
  "What limiting belief are you ready to release today?",
  "How did you honor your worth today?"
] as const;

export const FALLBACK_AFFIRMATIONS = [
  "I am a magnet for wealth and prosperity.",
  "Money flows to me easily and effortlessly.",
  "I release fear and welcome financial freedom.",
  "Abundance is my natural state of being."
] as const;

export const DEFAULT_PRACTICE = {
  title: "Money Reiki Practice",
  estimatedMinutes: 7,
  practiceType: "meditation"
} as const;

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "journal", label: "Journal", href: `${ROUTES.dashboard}#journal`, icon: NotebookPen },
  { id: "meditation", label: "Meditation", href: `${ROUTES.dashboard}#meditation`, icon: Brain },
  { id: "practice", label: "Practice", href: `${ROUTES.dashboard}#practice`, icon: Sparkles },
  { id: "courses", label: "Courses", href: ROUTES.courses, icon: GraduationCap },
  { id: "wish-box", label: "Wish Box", href: `${ROUTES.dashboard}#wish-box`, icon: Heart },
  { id: "vision-board", label: "Vision Board", href: `${ROUTES.dashboard}#vision-board`, icon: BookOpen },
  { id: "profile", label: "Profile", href: `${ROUTES.dashboard}#profile`, icon: UserRound }
];

export type StudentNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { title: "Home", href: ROUTES.dashboard, icon: Home },
  { title: "Courses", href: ROUTES.courses, icon: GraduationCap },
  { title: "Practice", href: `${ROUTES.dashboard}#practice`, icon: Sparkles },
  { title: "Journal", href: `${ROUTES.dashboard}#journal`, icon: NotebookPen },
  { title: "Profile", href: `${ROUTES.dashboard}#profile`, icon: UserRound }
];
