import { NotFoundError } from "@/lib/errors";
import { DEFAULT_INSTRUCTOR, XP_PER_LESSON } from "@/features/courses/constants";
import type { CourseDetailsViewModel, RelatedCoursesGroup } from "@/features/courses/detail-types";
import {
  buildModuleViewModels,
  buildOverviewContent,
  calculateCourseXpReward,
  findContinueLesson,
  flattenCourseLessons,
  mapLessonStatuses
} from "@/features/courses/detail-utils";
import { createCourseDetailsServices } from "@/features/courses/service";
import {
  buildCourseCardViewModel,
  calculateRemainingMinutes,
  pickCourseGradient
} from "@/features/courses/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Course, Lesson, UUID } from "@/types/core";

async function resolveCategoryForCourse(
  services: ReturnType<typeof createCourseDetailsServices>,
  courseId: UUID
) {
  const categories = await services.categories.getCategories();
  for (const category of categories) {
    const result = await services.categories.listCoursesByCategory(category.id, {
      pageSize: 100
    });
    if (result.data.some((course) => course.id === courseId)) {
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        color: category.color,
        courseCount: result.total
      };
    }
  }
  return null;
}

async function resolveLearningPathForCourse(
  services: ReturnType<typeof createCourseDetailsServices>,
  userId: UUID,
  courseId: UUID
) {
  const paths = await services.paths.listLearningPaths();
  for (const path of paths) {
    const pathData = await services.paths.getLearningPath(path.slug);
    if (pathData.courses.some((item) => item.course_id === courseId)) {
      const completionPercent = await services.paths.calculateCompletion(userId, path.id);
      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        level: path.level,
        courseCount: pathData.courses.length,
        completionPercent
      };
    }
  }
  return null;
}

async function buildRelatedCourses(
  services: ReturnType<typeof createCourseDetailsServices>,
  userId: UUID,
  course: Course,
  categoryId: string | null,
  pathCourseIds: string[]
): Promise<RelatedCoursesGroup> {
  const published = await services.courses.getPublishedCourses({ pageSize: 100 });
  const others = published.data.filter((item) => item.id !== course.id);

  const buildCards = async (courses: Course[]) =>
    Promise.all(
      courses.slice(0, 4).map(async (item, index) => {
        const modules = await services.courses.getModules(item.id);
        const lessons = await Promise.all(
          modules.map((module) => services.courses.getLessons(module.id))
        );
        const [progressPercent, isFavorite] = await Promise.all([
          services.courses.calculateCompletionPercentage(userId, item.id),
          services.favorites.isFavorite(userId, item.id)
        ]);
        return buildCourseCardViewModel(item, {
          lessonCount: lessons.flat().length,
          progressPercent,
          isFavorite,
          index
        });
      })
    );

  let sameCategory: Course[] = [];
  if (categoryId) {
    const result = await services.categories.listCoursesByCategory(categoryId, {
      pageSize: 10
    });
    sameCategory = result.data.filter((item) => item.id !== course.id);
  }

  const sameLearningPath = others.filter((item) => pathCourseIds.includes(item.id));
  const beginner = others.filter((item) => item.level === "beginner");

  return {
    sameCategory: await buildCards(sameCategory),
    sameLearningPath: await buildCards(sameLearningPath),
    beginner: await buildCards(beginner)
  };
}

export async function courseDetailsQuery(
  userId: UUID,
  courseSlug: string
): Promise<CourseDetailsViewModel> {
  const supabase = createSupabaseBrowserClient();
  const services = createCourseDetailsServices(supabase);

  let course: Course;
  try {
    course = await services.courses.getCourseBySlug(courseSlug);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw error;
  }

  if (!course.is_published) {
    throw new NotFoundError("Course was not found.");
  }

  const [
    modules,
    progressPercent,
    isFavorite,
    currentJourney,
    dailyMission,
    xpLevel,
    category,
    learningPath
  ] = await Promise.all([
    services.courses.getModules(course.id),
    services.courses.calculateCompletionPercentage(userId, course.id),
    services.favorites.isFavorite(userId, course.id),
    services.journey.currentJourney(userId),
    services.dailyMission.generateTodaysMission(userId),
    services.xp.currentLevel(userId),
    resolveCategoryForCourse(services, course.id),
    resolveLearningPathForCourse(services, userId, course.id)
  ]);

  const lessonsByModule = new Map<string, Lesson[]>();
  await Promise.all(
    modules.map(async (module) => {
      lessonsByModule.set(module.id, await services.courses.getLessons(module.id));
    })
  );

  const ordered = flattenCourseLessons(modules, lessonsByModule);
  const allLessonIds = ordered.map((item) => item.lesson.id);

  const [lessonProgressChecks, resumeRows] = await Promise.all([
    Promise.all(
      allLessonIds.map(async (lessonId) => {
        const progress = await services.lessonProgress.getProgress(userId, lessonId);
        return { id: lessonId, completed: Boolean(progress?.completed) };
      })
    ),
    Promise.all(allLessonIds.map((lessonId) => services.resume.loadPosition(userId, lessonId)))
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
  const moduleViewModels = buildModuleViewModels(modules, lessonCards);
  const continueLesson = findContinueLesson(lessonCards);
  const overviewBase = buildOverviewContent(
    course.description,
    course.level,
    modules.map((module) => module.title)
  );

  await services.recent.trackRecentlyViewed(
    userId,
    course.id,
    continueLesson?.id ?? null
  );

  const pathCourseIds = learningPath
    ? (await services.paths.getLearningPath(learningPath.slug)).courses.map(
        (item) => item.course_id
      )
    : [];

  const related = await buildRelatedCourses(
    services,
    userId,
    course,
    category?.id ?? null,
    pathCourseIds
  );

  const relatedCourses = [
    ...related.sameCategory,
    ...related.sameLearningPath.filter(
      (item) => !related.sameCategory.some((cat) => cat.id === item.id)
    ),
    ...related.beginner.filter(
      (item) =>
        !related.sameCategory.some((cat) => cat.id === item.id) &&
        !related.sameLearningPath.some((path) => path.id === item.id)
    )
  ].slice(0, 6);

  return {
    hero: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.description?.split(".")[0] ?? "Your guided abundance journey",
      difficulty: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      durationMinutes: course.duration_minutes,
      lessonCount: lessonCards.length,
      moduleCount: modules.length,
      estimatedCompletionMinutes: calculateRemainingMinutes(
        course.duration_minutes,
        progressPercent
      ),
      instructor: DEFAULT_INSTRUCTOR,
      category,
      learningPath,
      xpReward: calculateCourseXpReward(lessonCards.length, course.duration_minutes),
      progressPercent,
      thumbnailUrl: course.thumbnail_url,
      coverImageUrl: course.cover_image,
      isFavorite,
      gradientClass: pickCourseGradient(modules.length)
    },
    overview: {
      ...overviewBase,
      journeyRecommendation: currentJourney
        ? `This course supports Day ${currentJourney.userProgress.current_day} of ${currentJourney.journey.title}.`
        : null
    },
    modules: moduleViewModels,
    sidebar: {
      progressPercent,
      currentXp: xpLevel.currentXp,
      currentLevel: xpLevel.level,
      currentDay: currentJourney?.userProgress.current_day ?? null,
      remainingMinutes: calculateRemainingMinutes(course.duration_minutes, progressPercent),
      nextRewardXp: currentJourney?.currentDay?.reward_xp ?? XP_PER_LESSON,
      journeyProgressPercent: currentJourney?.userProgress.completion_percentage ?? 0,
      journeyTitle: currentJourney?.journey.title ?? null,
      continueLessonTitle: continueLesson?.title ?? null
    },
    relatedCourses,
    resources: [],
    allLessons: lessonCards
  };
}

export async function courseModulesQuery(userId: UUID, courseId: UUID) {
  const supabase = createSupabaseBrowserClient();
  const services = createCourseDetailsServices(supabase);
  const modules = await services.courses.getModules(courseId);
  const lessonsByModule = new Map<string, Lesson[]>();

  await Promise.all(
    modules.map(async (module) => {
      lessonsByModule.set(module.id, await services.courses.getLessons(module.id));
    })
  );

  const ordered = flattenCourseLessons(modules, lessonsByModule);
  const lessonProgressChecks = await Promise.all(
    ordered.map(async ({ lesson }) => {
      const progress = await services.lessonProgress.getProgress(userId, lesson.id);
      return { id: lesson.id, completed: Boolean(progress?.completed) };
    })
  );

  const completedLessonIds = new Set(
    lessonProgressChecks.filter((item) => item.completed).map((item) => item.id)
  );

  const lessonCards = mapLessonStatuses(ordered, completedLessonIds, new Set(), null);
  return buildModuleViewModels(modules, lessonCards);
}

export async function relatedCoursesQuery(userId: UUID, courseSlug: string) {
  const details = await courseDetailsQuery(userId, courseSlug);
  return details.relatedCourses;
}
