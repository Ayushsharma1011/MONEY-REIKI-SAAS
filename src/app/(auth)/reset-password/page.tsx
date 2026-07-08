import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password"
};

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Choose a new password"
        description="Use a strong password to keep your account protected."
      />
      <ResetPasswordForm />
    </AuthCard>
  );
}
