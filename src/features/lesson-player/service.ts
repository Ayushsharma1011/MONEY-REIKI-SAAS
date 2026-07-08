import type { SupabaseClient } from "@supabase/supabase-js";
import { CoreLessonService } from "@/features/core/service-implementations";
import { createCourseDetailsServices } from "@/features/courses/service";
import {
  CoreBookmarkService,
  CoreLessonNotesService,
  CoreLessonResourceService,
  CoreVideoService
} from "@/features/learning/service-implementations";
import {
  SupabaseBookmarkRepository,
  SupabaseLessonNotesRepository,
  SupabaseLessonResourceRepository,
  SupabaseVideoRepository
} from "@/features/learning/supabase-repositories";

export function createLessonPlayerServices(supabase: SupabaseClient) {
  const details = createCourseDetailsServices(supabase);

  return {
    ...details,
    lessons: new CoreLessonService(details.lessonProgress),
    video: new CoreVideoService(new SupabaseVideoRepository(supabase)),
    bookmarks: new CoreBookmarkService(new SupabaseBookmarkRepository(supabase)),
    notes: new CoreLessonNotesService(new SupabaseLessonNotesRepository(supabase)),
    resources: new CoreLessonResourceService(
      new SupabaseLessonResourceRepository(supabase)
    )
  };
}

export type LessonPlayerServices = ReturnType<typeof createLessonPlayerServices>;
