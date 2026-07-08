import type { Course } from "@/types/core";
import type { CourseCategory, LearningPathLevel } from "@/types/learning";

export type CourseProgressStatus = "not_started" | "in_progress" | "completed";

export type CourseCardViewModel = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  instructor: string;
  difficulty: string;
  durationMinutes: number;
  lessonCount: number;
  progressPercent: number;
  progressStatus: CourseProgressStatus;
  xpReward: number;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  isFavorite: boolean;
  hasBookmark: boolean;
  tags: string[];
  gradientClass: string;
};

export type CategoryChipViewModel = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  courseCount: number;
};

export type LearningPathViewModel = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: LearningPathLevel;
  courseCount: number;
  completionPercent: number;
};

export type CourseLibraryViewModel = {
  courses: CourseCardViewModel[];
  featuredCourse: CourseCardViewModel | null;
  continueCourse: CourseCardViewModel | null;
  recommendedCourses: CourseCardViewModel[];
  categories: CategoryChipViewModel[];
  learningPaths: LearningPathViewModel[];
  recentlyViewed: CourseCardViewModel[];
  favorites: CourseCardViewModel[];
  instructors: string[];
  tags: string[];
};

export type CourseFilterState = {
  search: string;
  categoryId: string | null;
  difficulty: string;
  duration: string;
  instructor: string | null;
  tag: string | null;
  progress: string;
  favoritesOnly: boolean;
};

export type CourseLibrarySection = keyof Pick<
  CourseLibraryViewModel,
  | "continueCourse"
  | "featuredCourse"
  | "recommendedCourses"
  | "learningPaths"
  | "categories"
  | "recentlyViewed"
  | "favorites"
  | "courses"
>;

export type { Course, CourseCategory };
