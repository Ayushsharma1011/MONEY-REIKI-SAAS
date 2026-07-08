"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  GraduationCap,
  Heart,
  Map,
  PlayCircle,
  Share2,
  Sparkles,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { formatDuration } from "@/features/courses/utils";
import type { CourseHeroViewModel } from "@/features/courses/detail-types";

type CourseHeroProps = {
  hero: CourseHeroViewModel;
  onContinue?: () => void;
  onToggleFavorite?: () => void;
};

function CourseHeroComponent({ hero, onContinue, onToggleFavorite }: CourseHeroProps) {
  const imageUrl = hero.coverImageUrl ?? hero.thumbnailUrl;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Course hero"
      className="relative overflow-hidden rounded-3xl border shadow-lg"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${hero.gradientClass}`} />
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="absolute inset-0 size-full object-cover opacity-35" src={imageUrl} />
      ) : null}
      <div className="from-background via-background/85 absolute inset-0 bg-gradient-to-r to-transparent" />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="bg-primary/15 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {hero.difficulty}
            </span>
            {hero.category ? (
              <span className="bg-card/80 rounded-full px-3 py-1 text-xs font-medium">
                {hero.category.name}
              </span>
            ) : null}
            {hero.learningPath ? (
              <span className="bg-card/80 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                <Map className="size-3" aria-hidden />
                {hero.learningPath.title}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{hero.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-base">{hero.subtitle}</p>
          <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <User className="size-4" aria-hidden />
              {hero.instructor}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden />
              {formatDuration(hero.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="size-4" aria-hidden />
              {hero.lessonCount} lessons · {hero.moduleCount} modules
            </span>
            <span className="text-accent inline-flex items-center gap-1 font-medium">
              <Sparkles className="size-4" aria-hidden />+{hero.xpReward} XP
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="gap-2" onClick={onContinue} size="lg" type="button">
              <PlayCircle className="size-4" aria-hidden />
              Continue Course
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              aria-label={hero.isFavorite ? "Remove favorite" : "Add favorite"}
              aria-pressed={hero.isFavorite}
              onClick={onToggleFavorite}
              size="lg"
              type="button"
              variant="outline"
            >
              <Heart
                className={hero.isFavorite ? "fill-rose-500 text-rose-500" : ""}
                aria-hidden
              />
            </Button>
            <Button aria-label="Share course" size="lg" type="button" variant="outline">
              <Share2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ProgressRing
            label="Complete"
            size={120}
            strokeWidth={8}
            value={hero.progressPercent}
          />
          <p className="text-muted-foreground text-xs">
            ~{formatDuration(hero.estimatedCompletionMinutes)} remaining
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export const CourseHero = memo(CourseHeroComponent);
CourseHero.displayName = "CourseHero";
