export function getFriendlyAuthError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : "authentication failed";

  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials")
  ) {
    return "The email or password is incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }

  if (message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (message.includes("expired")) {
    return "This secure link has expired. Please request a new one.";
  }

  return "Something went wrong. Please try again.";
}
