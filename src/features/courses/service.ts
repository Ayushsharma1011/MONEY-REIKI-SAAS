import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CoreCourseService
} from "@/features/core/service-implementations";
import {
  SupabaseCourseRepository,
  SupabaseLessonProgressRepository
} from "@/features/core/supabase-repositories";
import {
  CoreCourseCategoryService,
  CoreFavoriteCourseService,
  CoreLearningPathService,
  CoreRecentCourseService
} from "@/features/learning/service-implementations";
import {
  SupabaseCourseCategoryRepository,
  SupabaseFavoriteCourseRepository,
  SupabaseLearningPathRepository,
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
    courseRepository: courses
  };
}
