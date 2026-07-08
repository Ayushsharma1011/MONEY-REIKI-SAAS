"use client";

import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/app";
import { resendVerificationEmail } from "@/features/auth/service";

const RESEND_WAIT_SECONDS = 60;

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [remaining, setRemaining] = useState(RESEND_WAIT_SECONDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setRemaining((value) => value - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [remaining]);

  async function onResend() {
    if (!email) {
      toast.error("Enter your email on signup to resend verification.");
      return;
    }

    setLoading(true);
    const result = await resendVerificationEmail(email);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setRemaining(RESEND_WAIT_SECONDS);
    toast.success("Verification email resent.");
  }

  return (
    <div className="text-center">
      <div className="bg-primary text-primary-foreground mx-auto mb-5 flex size-14 items-center justify-center rounded-full">
        <CheckCircle2 className="size-7" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold">Verify your email</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        We sent a secure verification link{email ? ` to ${email}` : ""}.
      </p>
      <div className="bg-background/60 mt-6 rounded-lg border p-4">
        <Mail className="text-accent mx-auto mb-2 size-5" aria-hidden />
        <p className="text-muted-foreground text-sm">
          Open the link from your inbox to activate your account.
        </p>
      </div>
      <Button
        className="mt-6 w-full"
        type="button"
        variant="outline"
        onClick={onResend}
        disabled={remaining > 0 || loading}
      >
        {remaining > 0 ? `Resend in ${remaining}s` : "Resend email"}
      </Button>
      <Button className="mt-3 w-full" asChild>
        <Link href={ROUTES.login}>Go to sign in</Link>
      </Button>
    </div>
  );
}
