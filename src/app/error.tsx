"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled application error", {
      message: error.message,
      digest: error.digest
    });
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="bg-card max-w-md rounded-lg border p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The application caught an unexpected error.
        </p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
