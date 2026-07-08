"use client";

import { X } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="bg-card w-full max-w-lg rounded-lg border p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
