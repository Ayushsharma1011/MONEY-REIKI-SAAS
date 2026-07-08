"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loader";
import { ROUTES } from "@/constants/app";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { FieldError } from "@/features/auth/components/field-error";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput
} from "@/features/auth/schemas";
import { sendPasswordReset } from "@/features/auth/service";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  async function onSubmit(input: ForgotPasswordInput) {
    const result = await sendPasswordReset(input);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSentTo(input.email);
    toast.success("Password reset link sent.");
  }

  if (sentTo) {
    return (
      <div className="text-center">
        <MailCheck className="text-primary mx-auto mb-4 size-10" aria-hidden />
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          A secure reset link was sent to {sentTo}.
        </p>
        <AuthFooter
          prompt="Remembered your password?"
          href={ROUTES.login}
          label="Sign in"
        />
      </div>
    );
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
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Send link
      </Button>
      <AuthFooter prompt="Back to" href={ROUTES.login} label="Sign in" />
    </form>
  );
}
