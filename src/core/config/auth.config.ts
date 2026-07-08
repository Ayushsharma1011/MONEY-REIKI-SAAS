/** Authentication configuration for route and session infrastructure. */
export const authConfig = {
  publicRoutes: ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"],
  protectedRoutes: ["/dashboard", "/onboarding"],
  defaultAuthenticatedRoute: "/dashboard",
  defaultGuestRoute: "/login"
} as const;
