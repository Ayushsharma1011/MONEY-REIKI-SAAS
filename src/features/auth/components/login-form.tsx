"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { RememberMe } from "@/features/auth/components/remember-me";
import { SocialLogin } from "@/features/auth/components/social-login";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { signInWithEmail, signInWithOAuth } from "@/features/auth/service";

export function LoginForm() {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false }
  });

  async function onSubmit(input: LoginInput) {
    const result = await signInWithEmail(input);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Welcome back.");
    router.replace(ROUTES.dashboard);
    router.refresh();
  }

  async function onGoogle() {
    setOauthLoading(true);
    const result = await signInWithOAuth("google");

    if (result.error) {
      toast.error(result.error);
      setOauthLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Link
            className="text-primary text-sm font-medium hover:underline"
            href={ROUTES.forgotPassword}
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <RememberMe {...register("rememberMe")} />
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Sign in
      </Button>
      <SocialLogin
        label="Continue with Google"
        loading={oauthLoading}
        onGoogle={onGoogle}
      />
      <AuthFooter
        prompt="New to Money Reiki OS?"
        href={ROUTES.signup}
        label="Create account"
      />
    </form>
  );
}
