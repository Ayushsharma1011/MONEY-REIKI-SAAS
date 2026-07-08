export const COURSE_LIBRARY_QUERY_KEY = "course-library";

export const DEFAULT_INSTRUCTOR = "Money Reiki Faculty";

export const XP_PER_LESSON = 25;

export const SEARCH_DEBOUNCE_MS = 300;

export const DURATION_FILTERS = [
  { id: "all", label: "Any Duration", min: 0, max: Infinity },
  { id: "short", label: "Under 1 hr", min: 0, max: 60 },
  { id: "medium", label: "1–3 hrs", min: 60, max: 180 },
  { id: "long", label: "3+ hrs", min: 180, max: Infinity }
] as const;

export const PROGRESS_FILTERS = [
  { id: "all", label: "All Progress" },
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" }
] as const;

export const DIFFICULTY_FILTERS = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" }
] as const;

export const COURSE_PLACEHOLDER_GRADIENTS = [
  "from-violet-500/30 via-purple-500/20 to-fuchsia-500/30",
  "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
  "from-amber-500/30 via-orange-500/20 to-rose-500/30",
  "from-sky-500/30 via-blue-500/20 to-indigo-500/30"
] as const;
