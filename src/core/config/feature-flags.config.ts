import { platformEnv } from "@/core/config/env";

export const featureFlagsConfig = {
  AI_COACH: platformEnv.FEATURE_AI_COACH,
  COMMUNITY: platformEnv.FEATURE_COMMUNITY,
  LIVE_CLASSES: platformEnv.FEATURE_LIVE_CLASSES,
  PAYMENTS: platformEnv.FEATURE_PAYMENTS,
  ADMIN_PANEL: platformEnv.FEATURE_ADMIN_PANEL,
  REFERRAL_PROGRAM: platformEnv.FEATURE_REFERRAL_PROGRAM,
  CERTIFICATES: platformEnv.FEATURE_CERTIFICATES
} as const;

export type FeatureFlag = keyof typeof featureFlagsConfig;
