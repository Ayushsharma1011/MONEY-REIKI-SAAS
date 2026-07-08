import type { CourseCardViewModel, CategoryChipViewModel, LearningPathViewModel } from "@/features/courses/types";
import type { LessonResourceType } from "@/types/learning";

export type LessonDisplayStatus =
  | "locked"
  | "available"
  | "completed"
  | "current"
  | "preview"
  | "resume";

export type LessonCardViewModel = {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  lessonType: string;
  thumbnailUrl: string | null;
  status: LessonDisplayStatus;
  buttonLabel: string;
  progressPercent: number;
  isPreview: boolean;
  unlockRequirement: string | null;
  moduleId: string;
  orderIndex: number;
};

export type ModuleViewModel = {
  id: string;
  title: string;
  description: string | null;
  lessonCount: number;
  completionPercent: number;
  orderIndex: number;
  lessons: LessonCardViewModel[];
};

export type CourseOverviewViewModel = {
  description: string;
  whatYouWillLearn: string[];
  whoIsThisFor: string[];
  prerequisites: string[];
  skillsYouWillBuild: string[];
  journeyRecommendation: string | null;
};

export type CourseSidebarViewModel = {
  progressPercent: number;
  currentXp: number;
  currentLevel: number;
  currentDay: number | null;
  remainingMinutes: number;
  nextRewardXp: number;
  journeyProgressPercent: number;
  journeyTitle: string | null;
  continueLessonTitle: string | null;
};

export type CourseResourceViewModel = {
  id: string;
  title: string;
  resourceType: LessonResourceType;
  lessonTitle: string;
};

export type CourseHeroViewModel = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  difficulty: string;
  durationMinutes: number;
  lessonCount: number;
  moduleCount: number;
  estimatedCompletionMinutes: number;
  instructor: string;
  category: CategoryChipViewModel | null;
  learningPath: LearningPathViewModel | null;
  xpReward: number;
  progressPercent: number;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  isFavorite: boolean;
  gradientClass: string;
};

export type CourseDetailsViewModel = {
  hero: CourseHeroViewModel;
  overview: CourseOverviewViewModel;
  modules: ModuleViewModel[];
  sidebar: CourseSidebarViewModel;
  relatedCourses: CourseCardViewModel[];
  resources: CourseResourceViewModel[];
  allLessons: LessonCardViewModel[];
};

export type RelatedCoursesGroup = {
  sameCategory: CourseCardViewModel[];
  sameLearningPath: CourseCardViewModel[];
  beginner: CourseCardViewModel[];
};
