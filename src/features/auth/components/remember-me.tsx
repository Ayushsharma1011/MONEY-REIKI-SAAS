"use client";

import type { InputHTMLAttributes } from "react";

export function RememberMe(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="text-muted-foreground flex items-center gap-2 text-sm">
      <input
        className="border-input accent-primary size-4 rounded"
        type="checkbox"
        {...props}
      />
      Remember me
    </label>
  );
}
