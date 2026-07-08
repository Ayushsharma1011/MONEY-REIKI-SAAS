import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify Email"
};

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Almost there"
        description="Confirm your email to finish account setup."
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <VerifyEmailPanel />
      </Suspense>
    </AuthCard>
  );
}
