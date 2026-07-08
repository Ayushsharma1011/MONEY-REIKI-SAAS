"use client";

import { X } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  children,
  onClose,
  side = "right"
}: {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  side?: "left" | "right";
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="bg-background/70 fixed inset-0 z-50 backdrop-blur-sm">
      <aside
        className={cn(
          "bg-card fixed top-0 h-full w-80 max-w-[85vw] border p-5 shadow-xl",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        <Button
          className="mb-4"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="size-4" aria-hidden />
        </Button>
        {children}
      </aside>
    </div>
  );
}
