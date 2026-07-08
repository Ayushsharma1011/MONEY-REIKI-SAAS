import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CoreCourseService
} from "@/features/core/service-implementations";
import {
  SupabaseCourseRepository,
  SupabaseLessonProgressRepository
} from "@/features/core/supabase-repositories";
import { createJourneyServices } from "@/features/journey/service";
import {
  CoreCourseCategoryService,
  CoreFavoriteCourseService,
  CoreLearningPathService,
  CoreLessonResumeService,
  CoreRecentCourseService
} from "@/features/learning/service-implementations";
import {
  SupabaseCourseCategoryRepository,
  SupabaseFavoriteCourseRepository,
  SupabaseLearningPathRepository,
  SupabaseLessonResumeRepository,
  SupabaseRecentCourseRepository
} from "@/features/learning/supabase-repositories";

export function createCourseLibraryServices(supabase: SupabaseClient) {
  const courses = new SupabaseCourseRepository(supabase);
  const lessonProgress = new SupabaseLessonProgressRepository(supabase);

  return {
    courses: new CoreCourseService(courses, lessonProgress),
    categories: new CoreCourseCategoryService(
      new SupabaseCourseCategoryRepository(supabase)
    ),
    favorites: new CoreFavoriteCourseService(
      new SupabaseFavoriteCourseRepository(supabase)
    ),
    recent: new CoreRecentCourseService(new SupabaseRecentCourseRepository(supabase)),
    paths: new CoreLearningPathService(new SupabaseLearningPathRepository(supabase)),
    courseRepository: courses,
    lessonProgress
  };
}

export function createCourseDetailsServices(supabase: SupabaseClient) {
  const library = createCourseLibraryServices(supabase);
  const journey = createJourneyServices(supabase);

  return {
    ...library,
    journey: journey.journey,
    journeyTasks: journey.tasks,
    journeyProgress: journey.progress,
    dailyMission: journey.dailyMission,
    xp: journey.xp,
    resume: new CoreLessonResumeService(new SupabaseLessonResumeRepository(supabase))
  };
}
