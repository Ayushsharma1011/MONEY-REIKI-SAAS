import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Signup"
};

export default function SignupPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Create your account"
        description="Start with secure access built for your practice."
      />
      <SignupForm />
    </AuthCard>
  );
}
