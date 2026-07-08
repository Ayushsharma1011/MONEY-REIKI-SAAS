"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CategoryChipViewModel } from "@/features/courses/types";

type CategoryChipsProps = {
  categories: CategoryChipViewModel[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
};

function CategoryChipsComponent({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <section aria-label="Course categories">
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <motion.button
          aria-pressed={selectedId === null}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            selectedId === null
              ? "border-primary bg-primary/10 text-primary"
              : "bg-card/80 hover:bg-muted"
          )}
          onClick={() => onSelect(null)}
          type="button"
          whileTap={{ scale: 0.97 }}
        >
          All Courses
        </motion.button>
        {categories.map((category, index) => (
          <motion.button
            animate={{ opacity: 1, x: 0 }}
            aria-pressed={selectedId === category.id}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              selectedId === category.id
                ? "border-primary bg-primary/10 text-primary"
                : "bg-card/80 hover:bg-muted"
            )}
            initial={{ opacity: 0, x: 12 }}
            key={category.id}
            onClick={() => onSelect(category.id)}
            style={category.color ? { borderColor: category.color } : undefined}
            transition={{ delay: index * 0.04 }}
            type="button"
            whileTap={{ scale: 0.97 }}
          >
            {category.name}
            <span className="text-muted-foreground ml-2 text-xs">{category.courseCount}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

export const CategoryChips = memo(CategoryChipsComponent);
CategoryChips.displayName = "CategoryChips";
