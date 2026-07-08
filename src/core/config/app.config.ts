import { platformEnv } from "@/core/config/env";

/** Application-level configuration shared across features. */
export const appConfig = {
  name: "Money Reiki OS",
  version: "0.1.0",
  url: platformEnv.NEXT_PUBLIC_APP_URL,
  environment: process.env.NODE_ENV ?? "development"
} as const;
