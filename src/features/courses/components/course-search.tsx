"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CourseSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
};

function CourseSearchComponent({ value, onChange, onClear, className }: CourseSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label="Search courses"
        className="bg-card/80 h-11 pr-10 pl-10"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search courses, instructors, topics…"
        type="search"
        value={value}
      />
      {value ? (
        <button
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          type="button"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export const CourseSearch = memo(CourseSearchComponent);
CourseSearch.displayName = "CourseSearch";
