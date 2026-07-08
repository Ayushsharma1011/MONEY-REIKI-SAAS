export const APP_NAME = "Money Reiki OS";
export const APP_DESCRIPTION =
  "AI-powered student platform foundation for Money Reiki students.";

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  auth: "/auth"
} as const;

export const QUERY_STALE_TIME_MS = 60_000;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 60;
