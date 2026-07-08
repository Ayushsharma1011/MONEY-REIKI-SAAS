"use client";

import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";

export function GoogleButton({
  children,
  loading,
  onClick
}: {
  children: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className="w-full"
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : (
        <Chrome className="size-4" aria-hidden />
      )}
      {children}
    </Button>
  );
}
