"use client";

import { memo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type CourseLessonSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

function CourseLessonSearchComponent({ value, onChange }: CourseLessonSearchProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label="Search lessons in this course"
        className="pl-10"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search lessons in this course…"
        type="search"
        value={value}
      />
    </div>
  );
}

export const CourseLessonSearch = memo(CourseLessonSearchComponent);
CourseLessonSearch.displayName = "CourseLessonSearch";

export { CourseLessonSearch as CourseSearch };
