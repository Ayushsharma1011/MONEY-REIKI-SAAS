import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password"
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        description="We will send a secure password reset link."
      />
      <ForgotPasswordForm />
    </AuthCard>
  );
}
