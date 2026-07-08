"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles, Target, Users } from "lucide-react";
import type { CourseOverviewViewModel } from "@/features/courses/detail-types";

function OverviewList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ul className="text-muted-foreground space-y-2 text-sm">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseOverviewComponent({ overview }: { overview: CourseOverviewViewModel }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Course overview"
      className="bg-card/80 space-y-6 rounded-2xl border p-6 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">{overview.description}</p>
      </div>
      <OverviewList items={overview.whatYouWillLearn} title="What You Will Learn" />
      <OverviewList items={overview.whoIsThisFor} title="Who This Course Is For" />
      <OverviewList items={overview.prerequisites} title="Prerequisites" />
      <OverviewList items={overview.skillsYouWillBuild} title="Skills You'll Build" />
      {overview.journeyRecommendation ? (
        <div className="bg-primary/5 rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Compass className="text-primary size-4" aria-hidden />
            <h3 className="font-semibold">Journey Recommendation</h3>
          </div>
          <p className="text-muted-foreground text-sm">{overview.journeyRecommendation}</p>
        </div>
      ) : null}
      <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-1">
          <Target className="size-3.5" aria-hidden />
          Structured learning path
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          Guided by faculty
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="size-3.5" aria-hidden />
          Journey-integrated unlocks
        </span>
      </div>
    </motion.section>
  );
}

export const CourseOverview = memo(CourseOverviewComponent);
CourseOverview.displayName = "CourseOverview";
