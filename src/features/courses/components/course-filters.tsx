"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  PROGRESS_FILTERS
} from "@/features/courses/constants";
import type { CourseFilterState } from "@/features/courses/types";

type CourseFiltersProps = {
  filters: CourseFilterState;
  instructors: string[];
  tags: string[];
  onChange: (filters: CourseFilterState) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="text-muted-foreground font-medium">{label}</span>
      <select
        aria-label={label}
        className="bg-card/80 h-9 rounded-lg border px-3 text-sm"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CourseFiltersComponent({
  filters,
  instructors,
  tags,
  onChange
}: CourseFiltersProps) {
  const update = (partial: Partial<CourseFilterState>) =>
    onChange({ ...filters, ...partial });

  return (
    <motion.div
      animate={{ opacity: 1, height: "auto" }}
      className="bg-card/60 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
      initial={{ opacity: 0 }}
      layout
    >
      <FilterSelect
        label="Difficulty"
        onChange={(difficulty) => update({ difficulty })}
        options={[...DIFFICULTY_FILTERS]}
        value={filters.difficulty}
      />
      <FilterSelect
        label="Duration"
        onChange={(duration) => update({ duration })}
        options={DURATION_FILTERS.map((item) => ({ id: item.id, label: item.label }))}
        value={filters.duration}
      />
      <FilterSelect
        label="Progress"
        onChange={(progress) => update({ progress })}
        options={[...PROGRESS_FILTERS]}
        value={filters.progress}
      />
      <FilterSelect
        label="Instructor"
        onChange={(instructor) =>
          update({ instructor: instructor === "all" ? null : instructor })
        }
        options={[
          { id: "all", label: "All Instructors" },
          ...instructors.map((name) => ({ id: name, label: name }))
        ]}
        value={filters.instructor ?? "all"}
      />
      <FilterSelect
        label="Tags"
        onChange={(tag) => update({ tag: tag === "all" ? null : tag })}
        options={[
          { id: "all", label: "All Tags" },
          ...tags.map((tag) => ({ id: tag, label: tag }))
        ]}
        value={filters.tag ?? "all"}
      />
      <div className="flex flex-col justify-end">
        <Button
          aria-pressed={filters.favoritesOnly}
          className={cn(filters.favoritesOnly && "bg-primary/15 text-primary")}
          onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
          size="sm"
          type="button"
          variant="outline"
        >
          <Heart className="size-4" aria-hidden />
          Favorites Only
        </Button>
      </div>
    </motion.div>
  );
}

export const CourseFilters = memo(CourseFiltersComponent);
CourseFilters.displayName = "CourseFilters";
