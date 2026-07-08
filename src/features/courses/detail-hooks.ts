"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { COURSE_DETAILS_QUERY_KEY, COURSE_LIBRARY_QUERY_KEY } from "@/features/courses/constants";
import {
  courseDetailsQuery,
  courseModulesQuery,
  relatedCoursesQuery
} from "@/features/courses/detail-queries";
import type { CourseDetailsViewModel } from "@/features/courses/detail-types";
import { toggleFavoriteMutation } from "@/features/courses/queries";

export function useCourse(userId: string | undefined, courseSlug: string) {
  return useQuery<CourseDetailsViewModel, Error>({
    queryKey: [COURSE_DETAILS_QUERY_KEY, userId, courseSlug],
    queryFn: () => {
      if (!userId) throw new Error("User is required.");
      return courseDetailsQuery(userId, courseSlug);
    },
    enabled: Boolean(userId && courseSlug),
    retry: (_, error) => !error.message.toLowerCase().includes("not found")
  });
}

export function useCourseModules(
  userId: string | undefined,
  courseId: string | undefined
) {
  return useQuery({
    queryKey: [COURSE_DETAILS_QUERY_KEY, userId, "modules", courseId],
    queryFn: () => courseModulesQuery(userId!, courseId!),
    enabled: Boolean(userId && courseId)
  });
}

export function useCourseLessons(
  userId: string | undefined,
  courseSlug: string
) {
  return useQuery({
    queryKey: [COURSE_DETAILS_QUERY_KEY, userId, courseSlug],
    queryFn: () => courseDetailsQuery(userId!, courseSlug),
    enabled: Boolean(userId && courseSlug),
    select: (data) => data.allLessons
  });
}

export function useRelatedCourses(userId: string | undefined, courseSlug: string) {
  return useQuery({
    queryKey: [COURSE_DETAILS_QUERY_KEY, userId, courseSlug, "related"],
    queryFn: () => relatedCoursesQuery(userId!, courseSlug),
    enabled: Boolean(userId && courseSlug)
  });
}

export function useToggleCourseFavorite(userId: string | undefined, courseSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, isFavorite }: { courseId: string; isFavorite: boolean }) => {
      if (!userId) throw new Error("User is required.");
      return toggleFavoriteMutation(userId, courseId, isFavorite);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [COURSE_DETAILS_QUERY_KEY, userId, courseSlug]
      });
      void queryClient.invalidateQueries({ queryKey: [COURSE_LIBRARY_QUERY_KEY, userId] });
    }
  });
}
