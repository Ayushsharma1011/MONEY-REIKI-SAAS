export const PLATFORM_ROLES = ["student", "mentor", "admin", "super_admin"] as const;
export const PLATFORM_THEMES = ["light", "dark", "system"] as const;
export const PLATFORM_LANGUAGES = ["english", "hindi", "hinglish"] as const;

export const PLATFORM_PERMISSIONS = [
  "course:read",
  "course:write",
  "journal:read",
  "journal:write",
  "practice:read",
  "practice:write",
  "notification:read",
  "notification:write",
  "analytics:read",
  "admin:access"
] as const;

export const PLATFORM_ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  onboarding: "/onboarding",
  dashboard: "/dashboard"
} as const;

export const NOTIFICATION_TYPES = ["system", "practice", "course", "challenge", "admin"] as const;
export const PRACTICE_TYPES = ["meditation", "affirmation", "journal", "gratitude"] as const;
export const CHALLENGE_TYPES = ["streak", "mindset", "practice"] as const;

export const STORAGE_BUCKETS = [
  "avatars",
  "journal-images",
  "wish-box",
  "vision-board",
  "lesson-assets",
  "course-thumbnails",
  "certificates"
] as const;

export const ERROR_MESSAGES = {
  unauthorized: "Authentication is required.",
  forbidden: "You do not have permission to perform this action.",
  validation: "Please check the submitted information.",
  notFound: "The requested resource was not found.",
  conflict: "A conflicting resource already exists."
} as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];
export type PlatformStorageBucket = (typeof STORAGE_BUCKETS)[number];
