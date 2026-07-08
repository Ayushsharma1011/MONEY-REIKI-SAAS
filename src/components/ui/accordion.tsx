"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

export function Accordion({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <ChevronDown className="size-4" aria-hidden />
      </button>
      {open ? (
        <div className="text-muted-foreground border-t px-4 py-3 text-sm">
          {children}
        </div>
      ) : null}
    </div>
  );
}
