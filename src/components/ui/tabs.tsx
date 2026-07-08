"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items[0]?.value ?? "");
  const current = items.find((item) => item.value === active);

  return (
    <div>
      <div
        className="bg-muted inline-flex rounded-md border p-1"
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.value}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm transition-colors",
              item.value === active && "bg-background shadow-sm"
            )}
            type="button"
            role="tab"
            aria-selected={item.value === active}
            onClick={() => setActive(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{current?.content}</div>
    </div>
  );
}
