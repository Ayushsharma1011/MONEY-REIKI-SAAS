import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CoreCourseService,
  CoreDashboardService
} from "@/features/core/service-implementations";
import {
  SupabaseChallengeRepository,
  SupabaseCourseRepository,
  SupabaseDashboardRepository,
  SupabaseJournalRepository,
  SupabaseLessonProgressRepository,
  SupabaseMeditationRepository,
  SupabaseNotificationRepository,
  SupabasePracticeRepository
} from "@/features/core/supabase-repositories";
import { createJourneyServices } from "@/features/journey/service";

export function createDashboardServices(supabase: SupabaseClient) {
  const courses = new SupabaseCourseRepository(supabase);
  const lessonProgress = new SupabaseLessonProgressRepository(supabase);
  const journeyServices = createJourneyServices(supabase);

  return {
    dashboard: new CoreDashboardService(
      new SupabaseDashboardRepository(supabase),
      new SupabasePracticeRepository(supabase),
      courses,
      new SupabaseMeditationRepository(supabase),
      new SupabaseNotificationRepository(supabase),
      new SupabaseJournalRepository(supabase),
      new SupabaseChallengeRepository(supabase),
      journeyServices.dailyMission
    ),
    courses: new CoreCourseService(courses, lessonProgress),
    journey: journeyServices
  };
}
