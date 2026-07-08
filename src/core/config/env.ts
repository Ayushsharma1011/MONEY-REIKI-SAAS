import { z } from "zod";

const booleanEnv = z
  .enum(["true", "false", "1", "0"])
  .default("false")
  .transform((value) => value === "true" || value === "1");

export const platformEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  FEATURE_AI_COACH: booleanEnv,
  FEATURE_COMMUNITY: booleanEnv,
  FEATURE_LIVE_CLASSES: booleanEnv,
  FEATURE_PAYMENTS: booleanEnv,
  FEATURE_ADMIN_PANEL: booleanEnv,
  FEATURE_REFERRAL_PROGRAM: booleanEnv,
  FEATURE_CERTIFICATES: booleanEnv
});

/** Validated platform environment for shared infrastructure. */
export const platformEnv = platformEnvSchema.parse(process.env);
