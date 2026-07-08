"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loader";
import { ROUTES } from "@/constants/app";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { FieldError } from "@/features/auth/components/field-error";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { SocialLogin } from "@/features/auth/components/social-login";
import { signupSchema, type SignupInput } from "@/features/auth/schemas";
import { signInWithOAuth, signUpWithEmail } from "@/features/auth/service";

export function SignupForm() {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  async function onSubmit(input: SignupInput) {
    const result = await signUpWithEmail(input);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Account created. Check your email to verify it.");
    router.push(
      `${ROUTES.verifyEmail}?email=${encodeURIComponent(input.email)}`
    );
  }

  async function onGoogle() {
    setOauthLoading(true);
    const result = await signInWithOAuth("google");

    if (result.error) {
      toast.error(result.error);
      setOauthLoading(false);
    }
  }

  const password = watch("password");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="fullName">
          Full name
        </label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...register("password")}
        />
        <PasswordStrength password={password} />
        <FieldError message={errors.password?.message} />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <label className="text-muted-foreground flex items-start gap-2 text-sm">
        <input
          className="border-input accent-primary mt-0.5 size-4 rounded"
          type="checkbox"
          {...register("acceptTerms")}
        />
        I accept the terms and privacy policy.
      </label>
      <FieldError message={errors.acceptTerms?.message} />
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Sign up
      </Button>
      <SocialLogin
        label="Sign up with Google"
        loading={oauthLoading}
        onGoogle={onGoogle}
      />
      <AuthFooter
        prompt="Already have an account?"
        href={ROUTES.login}
        label="Sign in"
      />
    </form>
  );
}
