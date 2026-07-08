"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { ROUTES } from "@/constants/app";
import { FieldError } from "@/features/auth/components/field-error";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import {
  resetPasswordSchema,
  type ResetPasswordInput
} from "@/features/auth/schemas";
import { updatePassword } from "@/features/auth/service";

export function ResetPasswordForm() {
  const [changed, setChanged] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  async function onSubmit(input: ResetPasswordInput) {
    const result = await updatePassword(input);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setChanged(true);
    toast.success("Password changed.");
  }

  if (changed) {
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary text-primary-foreground mx-auto mb-4 flex size-14 items-center justify-center rounded-full"
        >
          <CheckCircle2 className="size-7" aria-hidden />
        </motion.div>
        <h2 className="text-xl font-semibold">Password updated</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Your new password is active.
        </p>
        <Button className="mt-6" asChild>
          <Link href={ROUTES.login}>Sign in</Link>
        </Button>
      </div>
    );
  }

  const password = watch("password");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          New password
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
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Change password
      </Button>
    </form>
  );
}
