import { NotFoundError } from "@/lib/errors";
import { XP_PER_LESSON } from "@/features/courses/constants";
import {
  buildModuleViewModels,
  flattenCourseLessons,
  mapLessonStatuses
} from "@/features/courses/detail-utils";
import type { LessonCardViewModel } from "@/features/courses/detail-types";
import { createLessonPlayerServices } from "@/features/lesson-player/service";
import type {
  CompleteLessonResult,
  LessonBookmarkViewModel,
  LessonNoteViewModel,
  LessonPlayerViewModel
} from "@/features/lesson-player/types";
import { formatTimestamp, mapLessonResource } from "@/features/lesson-player/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CourseModule, Lesson, UUID } from "@/types/core";
import type { Bookmark, LessonNote } from "@/types/learning";

async function resolveLessonInCourse(
  modules: CourseModule[],
  getLessons: (moduleId: UUID) => Promise<Lesson[]>,
  lessonSlug: string
) {
  for (const courseModule of [...modules].sort((a, b) => a.order_index - b.order_index)) {
    const lessons = await getLessons(courseModule.id);
    const lesson = lessons.find((item) => item.slug === lessonSlug);
    if (lesson) {
      return { lesson, module: courseModule };
    }
  }
  return null;
}

async function resolveVideo(
  services: ReturnType<typeof createLessonPlayerServices>,
  lesson: Lesson
) {
  if (lesson.video_url) {
    return {
      state: "ready" as const,
      url: lesson.video_url,
      provider: null,
      errorMessage: null
    };
  }

  if (lesson.lesson_type !== "video") {
    return {
      state: "none" as const,
      url: null,
      provider: null,
      errorMessage: "This lesson does not include a video."
    };
  }

  try {
    const playback = await services.video.getPlaybackUrl(lesson.id);
    return {
      state: "ready" as const,
      url: playback.url,
      provider: playback.provider,
      errorMessage: null
    };
  } catch {
    return {
      state: "processing" as const,
      url: null,
      provider: null,
      errorMessage: "Video is being processed. Check back soon."
    };
  }
}

function findNextLesson(
  allLessons: LessonCardViewModel[],
  currentLessonId: string
): LessonCardViewModel | null {
  const index = allLessons.findIndex((lesson) => lesson.id === currentLessonId);
  if (index < 0) return null;

  for (let i = index + 1; i < allLessons.length; i += 1) {
    const candidate = allLessons[i];
    if (candidate && candidate.status !== "locked") {
      return candidate;
    }
  }

  return null;
}

export async function lessonPlayerQuery(
  userId: UUID,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonPlayerViewModel> {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);

  let course;
  try {
    course = await services.courses.getCourseBySlug(courseSlug);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw error;
  }

  if (!course.is_published) {
    throw new NotFoundError("Course was not found.");
  }

  const modules = await services.courses.getModules(course.id);
  const resolved = await resolveLessonInCourse(modules, (moduleId) =>
    services.courses.getLessons(moduleId)
  , lessonSlug);

  if (!resolved) {
    throw new NotFoundError("Lesson was not found.");
  }

  const { lesson, module } = resolved;

  const lessonsByModule = new Map<string, Lesson[]>();
  await Promise.all(
    modules.map(async (courseModule) => {
      lessonsByModule.set(
        courseModule.id,
        await services.courses.getLessons(courseModule.id)
      );
    })
  );

  const ordered = flattenCourseLessons(modules, lessonsByModule);
  const allLessonIds = ordered.map((item) => item.lesson.id);

  const [lessonProgressChecks, resumeRows, progressPercent, currentJourney, dailyMission] =
    await Promise.all([
      Promise.all(
        allLessonIds.map(async (lessonId) => {
          const progress = await services.lessonProgress.getProgress(userId, lessonId);
          return { id: lessonId, completed: Boolean(progress?.completed) };
        })
      ),
      Promise.all(allLessonIds.map((lessonId) => services.resume.loadPosition(userId, lessonId))),
      services.courses.calculateCompletionPercentage(userId, course.id),
      services.journey.currentJourney(userId),
      services.dailyMission.generateTodaysMission(userId)
    ]);

  const completedLessonIds = new Set(
    lessonProgressChecks.filter((item) => item.completed).map((item) => item.id)
  );

  const resumeLessonIds = new Set(
    resumeRows
      .filter((row) => row && !row.completed && row.last_position_seconds > 0)
      .map((row) => row!.lesson_id)
  );

  const journeyLessonTask = dailyMission?.tasks.find(
    (task) => task.task_type === "lesson" && task.lesson_id && task.course_id === course.id
  );

  const lessonCards = mapLessonStatuses(
    ordered,
    completedLessonIds,
    resumeLessonIds,
    journeyLessonTask?.lesson_id ?? null
  );

  const currentCard = lessonCards.find((item) => item.id === lesson.id);
  const lessonIndex = ordered.findIndex((item) => item.lesson.id === lesson.id);
  const resume = await services.resume.loadPosition(userId, lesson.id);
  const progress = await services.lessonProgress.getProgress(userId, lesson.id);
  const video = await resolveVideo(services, lesson);

  let accessState: LessonPlayerViewModel["accessState"] = "available";
  if (currentCard?.status === "locked") accessState = "locked";
  else if (currentCard?.isPreview) accessState = "preview";

  const nextCandidate = findNextLesson(lessonCards, lesson.id);

  await services.recent.trackRecentlyViewed(userId, course.id, lesson.id);

  const moduleViewModels = buildModuleViewModels(modules, lessonCards);

  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    accessState,
    header: {
      title: lesson.title,
      moduleTitle: module.title,
      lessonNumber: lessonIndex + 1,
      totalLessons: lessonCards.length,
      journeyDay: currentJourney?.userProgress.current_day ?? null,
      xpReward: XP_PER_LESSON,
      difficulty: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      estimatedMinutes: lesson.duration,
      lessonType: lesson.lesson_type
    },
    video: {
      ...video,
      thumbnailUrl: lesson.thumbnail,
      durationSeconds: lesson.duration * 60,
      resumePositionSeconds: resume?.last_position_seconds ?? 0,
      playbackSpeed: resume?.playback_speed ?? 1
    },
    overview: {
      description: lesson.description
    },
    sidebar: {
      courseTitle: course.title,
      courseSlug: course.slug,
      progressPercent,
      currentModuleTitle: module.title,
      journeyDay: currentJourney?.userProgress.current_day ?? null,
      journeyProgressPercent: currentJourney?.userProgress.completion_percentage ?? 0,
      journeyTitle: currentJourney?.journey.title ?? null,
      modules: moduleViewModels,
      currentLessonId: lesson.id
    },
    nextLesson: nextCandidate
      ? {
          id: nextCandidate.id,
          slug: nextCandidate.slug,
          title: nextCandidate.title,
          durationMinutes: nextCandidate.durationMinutes,
          xpReward: XP_PER_LESSON
        }
      : null,
    journeyTaskId:
      dailyMission?.tasks.find(
        (task) => task.task_type === "lesson" && task.lesson_id === lesson.id
      )?.id ?? null,
    journeyId: currentJourney?.journey.id ?? null,
    isCompleted: Boolean(progress?.completed),
    watchTimeSeconds: progress?.watch_time ?? resume?.duration_watched ?? 0,
    allLessons: lessonCards
  };
}

export async function lessonNotesQuery(userId: UUID, lessonId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  const notes = await services.notes.listNotesForLesson(userId, lessonId);
  return notes.map(
    (note): LessonNoteViewModel => ({
      id: note.id,
      content: note.content,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    })
  );
}

export async function lessonBookmarksQuery(userId: UUID, lessonId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  const bookmarks = await services.bookmarks.listBookmarks(userId, lessonId);
  return bookmarks.map(
    (bookmark): LessonBookmarkViewModel => ({
      id: bookmark.id,
      timestampSeconds: bookmark.timestamp_seconds,
      note: bookmark.note,
      formattedTime: formatTimestamp(bookmark.timestamp_seconds)
    })
  );
}

export async function lessonResourcesQuery(lessonId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  const resources = await services.resources.listResources(lessonId);
  return resources.map(mapLessonResource);
}

export async function saveLessonResumeMutation(
  userId: UUID,
  input: {
    lessonId: UUID;
    positionSeconds: number;
    watchTimeSeconds: number;
    playbackSpeed: number;
  }
) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  return services.resume.savePosition(userId, {
    lesson_id: input.lessonId,
    last_position_seconds: input.positionSeconds,
    duration_watched: input.watchTimeSeconds,
    playback_speed: input.playbackSpeed
  });
}

export async function createLessonNoteMutation(
  userId: UUID,
  lessonId: UUID,
  content: string
): Promise<LessonNote> {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  return services.notes.createNote(userId, { lesson_id: lessonId, content });
}

export async function editLessonNoteMutation(
  userId: UUID,
  noteId: UUID,
  content: string
): Promise<LessonNote> {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  return services.notes.editNote(userId, noteId, content);
}

export async function deleteLessonNoteMutation(userId: UUID, noteId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  await services.notes.deleteNote(userId, noteId);
}

export async function createBookmarkMutation(
  userId: UUID,
  input: Pick<Bookmark, "lesson_id" | "timestamp_seconds" | "note">
) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  return services.bookmarks.createBookmark(userId, input);
}

export async function deleteBookmarkMutation(userId: UUID, bookmarkId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);
  await services.bookmarks.deleteBookmark(userId, bookmarkId);
}

export async function completeLessonMutation(
  userId: UUID,
  input: {
    lessonId: UUID;
    watchTimeSeconds: number;
    journeyTaskId: string | null;
    journeyId: string | null;
    xpAmount: number;
    courseSlug: string;
    lessonSlug: string;
  }
): Promise<CompleteLessonResult> {
  const supabase = createSupabaseBrowserClient();
  const services = createLessonPlayerServices(supabase);

  await services.lessons.markComplete(userId, input.lessonId, input.watchTimeSeconds);
  await services.resume.markComplete(userId, input.lessonId);

  if (input.journeyTaskId) {
    await services.journeyTasks.completeTask(userId, input.journeyTaskId, input.watchTimeSeconds);
  }

  let xpAwarded = 0;
  if (input.journeyId) {
    xpAwarded = await services.xp.awardXp(
      userId,
      input.journeyId,
      input.xpAmount,
      `Completed lesson ${input.lessonSlug}`
    );
  }

  const player = await lessonPlayerQuery(userId, input.courseSlug, input.lessonSlug);
  const journey = await services.journey.currentJourney(userId);

  return {
    xpAwarded,
    nextLesson: player.nextLesson,
    journeyProgressPercent: journey?.userProgress.completion_percentage ?? null
  };
}
