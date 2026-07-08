"use client";

import { GoogleButton } from "@/features/auth/components/google-button";

export function SocialLogin({
  label,
  loading,
  onGoogle
}: {
  label: string;
  loading?: boolean;
  onGoogle: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">Or</span>
        </div>
      </div>
      <GoogleButton loading={loading} onClick={onGoogle}>
        {label}
      </GoogleButton>
    </div>
  );
}
