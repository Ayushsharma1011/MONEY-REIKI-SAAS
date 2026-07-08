export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type AppErrorCode =
  | "UNKNOWN"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED";

export type AppError = {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
};
