import { createCourseLibraryServices } from "@/features/courses/service";
import type { CourseLibraryViewModel } from "@/features/courses/types";
import {
  buildCourseCardViewModel,
  pickContinueCourse,
  pickFeaturedCourse,
  pickRecommendedCourses
} from "@/features/courses/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UUID } from "@/types/core";

async function buildCourseCards(
  userId: UUID,
  services: ReturnType<typeof createCourseLibraryServices>
) {
  const [published, favorites, recent] = await Promise.all([
    services.courses.getPublishedCourses({ pageSize: 100 }),
    services.favorites.listFavorites(userId, { pageSize: 100 }),
    services.recent.listRecentlyViewed(userId, { pageSize: 12 })
  ]);

  const favoriteIds = new Set(favorites.data.map((item) => item.course_id));
  const recentIds = new Set(recent.data.map((item) => item.course_id));

  const cards = await Promise.all(
    published.data.map(async (course, index) => {
      const [modules, progressPercent] = await Promise.all([
        services.courses.getModules(course.id),
        services.courses.calculateCompletionPercentage(userId, course.id)
      ]);

      const lessons = await Promise.all(
        modules.map((module) => services.courses.getLessons(module.id))
      );
      const lessonCount = lessons.flat().length;

      return buildCourseCardViewModel(course, {
        lessonCount,
        progressPercent,
        isFavorite: favoriteIds.has(course.id),
        hasBookmark: recentIds.has(course.id),
        index
      });
    })
  );

  return { cards, favorites, recent };
}

export async function courseLibraryQuery(userId: UUID): Promise<CourseLibraryViewModel> {
  const supabase = createSupabaseBrowserClient();
  const services = createCourseLibraryServices(supabase);

  const { cards, favorites, recent } = await buildCourseCards(userId, services);

  const courseMap = new Map(cards.map((course) => [course.id, course]));

  const [categoriesRaw, pathsRaw] = await Promise.all([
    services.categories.getCategories(),
    services.paths.listLearningPaths()
  ]);

  const categories = await Promise.all(
    categoriesRaw.map(async (category) => {
      const result = await services.categories.listCoursesByCategory(category.id, {
        pageSize: 1
      });
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        color: category.color,
        courseCount: result.total
      };
    })
  );

  const learningPaths = await Promise.all(
    pathsRaw.map(async (path) => {
      const pathCourses = await services.paths.getLearningPath(path.slug);
      const completionPercent = await services.paths.calculateCompletion(userId, path.id);
      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        level: path.level,
        courseCount: pathCourses.courses.length,
        completionPercent
      };
    })
  );

  const recentlyViewed = recent.data
    .map((item) => courseMap.get(item.course_id))
    .filter((course): course is NonNullable<typeof course> => Boolean(course));

  const favoriteCourses = favorites.data
    .map((item) => courseMap.get(item.course_id))
    .filter((course): course is NonNullable<typeof course> => Boolean(course));

  const continueCourse = pickContinueCourse(cards);
  const featuredCourse = pickFeaturedCourse(cards);
  const recommendedCourses = pickRecommendedCourses(cards, continueCourse?.id ?? null);

  const instructors = [...new Set(cards.map((course) => course.instructor))].sort();
  const tags = [...new Set(cards.flatMap((course) => course.tags))].sort();

  return {
    courses: cards,
    featuredCourse,
    continueCourse,
    recommendedCourses,
    categories,
    learningPaths,
    recentlyViewed,
    favorites: favoriteCourses,
    instructors,
    tags
  };
}

export async function toggleFavoriteMutation(
  userId: UUID,
  courseId: UUID,
  isFavorite: boolean
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { favorites } = createCourseLibraryServices(supabase);

  if (isFavorite) {
    await favorites.unfavorite(userId, courseId);
  } else {
    await favorites.favorite(userId, courseId);
  }
}

export async function coursesByCategoryQuery(
  userId: UUID,
  categoryId: UUID
): Promise<CourseLibraryViewModel["courses"]> {
  const supabase = createSupabaseBrowserClient();
  const services = createCourseLibraryServices(supabase);
  const result = await services.categories.listCoursesByCategory(categoryId, {
    pageSize: 100
  });

  return Promise.all(
    result.data.map(async (course, index) => {
      const [modules, progressPercent, isFavorite] = await Promise.all([
        services.courses.getModules(course.id),
        services.courses.calculateCompletionPercentage(userId, course.id),
        services.favorites.isFavorite(userId, course.id)
      ]);
      const lessons = await Promise.all(
        modules.map((module) => services.courses.getLessons(module.id))
      );

      return buildCourseCardViewModel(course, {
        lessonCount: lessons.flat().length,
        progressPercent,
        isFavorite,
        index
      });
    })
  );
}
