export const COURSE_LIBRARY_QUERY_KEY = "course-library";
export const COURSE_DETAILS_QUERY_KEY = "course-details";
export const LESSON_PLAYER_QUERY_KEY = "lesson-player";
export const LESSON_NOTES_QUERY_KEY = "lesson-notes";
export const LESSON_BOOKMARKS_QUERY_KEY = "lesson-bookmarks";
export const LESSON_RESOURCES_QUERY_KEY = "lesson-resources";

export const DEFAULT_INSTRUCTOR = "Money Reiki Faculty";

export const XP_PER_LESSON = 25;

export const RESUME_SAVE_INTERVAL_MS = 15_000;
export const SEEK_STEP_SECONDS = 10;
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

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
