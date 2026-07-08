import {
  COURSE_PLACEHOLDER_GRADIENTS,
  DEFAULT_INSTRUCTOR,
  XP_PER_LESSON
} from "@/features/courses/constants";
import type {
  CourseCardViewModel,
  CourseFilterState,
  CourseProgressStatus
} from "@/features/courses/types";
import type { Course } from "@/types/core";

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function calculateXpReward(lessonCount: number, durationMinutes: number): number {
  return Math.max(lessonCount * XP_PER_LESSON, Math.round(durationMinutes / 10) * 5);
}

export function calculateRemainingMinutes(
  durationMinutes: number,
  progressPercent: number
): number {
  return Math.max(0, Math.round(durationMinutes * (1 - progressPercent / 100)));
}

export function getProgressStatus(progressPercent: number): CourseProgressStatus {
  if (progressPercent >= 100) return "completed";
  if (progressPercent > 0) return "in_progress";
  return "not_started";
}

export function pickCourseGradient(index: number): string {
  return COURSE_PLACEHOLDER_GRADIENTS[index % COURSE_PLACEHOLDER_GRADIENTS.length] as string;
}

export function truncateDescription(text: string | null, maxLength = 120): string {
  if (!text) return "Explore this transformative Money Reiki course.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function formatDifficulty(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function buildCourseCardViewModel(
  course: Course,
  options: {
    lessonCount: number;
    progressPercent: number;
    isFavorite: boolean;
    hasBookmark?: boolean;
    instructor?: string;
    tags?: string[];
    index?: number;
  }
): CourseCardViewModel {
  const progressStatus = getProgressStatus(options.progressPercent);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDescription: truncateDescription(course.description),
    instructor: options.instructor ?? DEFAULT_INSTRUCTOR,
    difficulty: formatDifficulty(course.level),
    durationMinutes: course.duration_minutes,
    lessonCount: options.lessonCount,
    progressPercent: options.progressPercent,
    progressStatus,
    xpReward: calculateXpReward(options.lessonCount, course.duration_minutes),
    thumbnailUrl: course.thumbnail_url,
    coverImageUrl: course.cover_image,
    isFavorite: options.isFavorite,
    hasBookmark: options.hasBookmark ?? progressStatus === "in_progress",
    tags: options.tags ?? [],
    gradientClass: pickCourseGradient(options.index ?? 0)
  };
}

export function filterCourses(
  courses: CourseCardViewModel[],
  filters: CourseFilterState
): CourseCardViewModel[] {
  const search = filters.search.trim().toLowerCase();

  return courses.filter((course) => {
    if (filters.favoritesOnly && !course.isFavorite) return false;

    if (search) {
      const haystack = [
        course.title,
        course.shortDescription,
        course.instructor,
        ...course.tags
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.difficulty !== "all") {
      if (course.difficulty.toLowerCase() !== filters.difficulty) return false;
    }

    if (filters.instructor && course.instructor !== filters.instructor) return false;

    if (filters.tag && !course.tags.includes(filters.tag)) return false;

    if (filters.progress !== "all") {
      if (course.progressStatus !== filters.progress) return false;
    }

    if (filters.duration !== "all") {
      const durationMap = {
        short: [0, 60] as const,
        medium: [60, 180] as const,
        long: [180, Number.POSITIVE_INFINITY] as const
      };
      const durationFilter = durationMap[filters.duration as keyof typeof durationMap];

      if (durationFilter) {
        const [min, max] = durationFilter;
        if (course.durationMinutes < min || course.durationMinutes > max) return false;
      }
    }

    return true;
  });
}

export function pickFeaturedCourse(courses: CourseCardViewModel[]): CourseCardViewModel | null {
  const inProgress = courses
    .filter((course) => course.progressStatus === "in_progress")
    .sort((a, b) => b.progressPercent - a.progressPercent);
  if (inProgress[0]) return inProgress[0];
  return courses[0] ?? null;
}

export function pickContinueCourse(courses: CourseCardViewModel[]): CourseCardViewModel | null {
  return (
    courses
      .filter((course) => course.progressStatus === "in_progress")
      .sort((a, b) => b.progressPercent - a.progressPercent)[0] ?? null
  );
}

export function pickRecommendedCourses(
  courses: CourseCardViewModel[],
  continueCourseId: string | null,
  limit = 6
): CourseCardViewModel[] {
  return courses
    .filter(
      (course) =>
        course.id !== continueCourseId &&
        course.progressStatus !== "completed"
    )
    .slice(0, limit);
}

export const DEFAULT_FILTERS: CourseFilterState = {
  search: "",
  categoryId: null,
  difficulty: "all",
  duration: "all",
  instructor: null,
  tag: null,
  progress: "all",
  favoritesOnly: false
};
