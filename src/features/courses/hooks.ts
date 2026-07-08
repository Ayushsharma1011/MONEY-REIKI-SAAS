"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { COURSE_LIBRARY_QUERY_KEY, SEARCH_DEBOUNCE_MS } from "@/features/courses/constants";
import {
  courseLibraryQuery,
  coursesByCategoryQuery,
  toggleFavoriteMutation
} from "@/features/courses/queries";
import type { CourseFilterState, CourseLibraryViewModel } from "@/features/courses/types";
import { DEFAULT_FILTERS, filterCourses } from "@/features/courses/utils";

export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function useCourseLibraryQuery(userId: string | undefined) {
  return useQuery<CourseLibraryViewModel, Error>({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error("User is required to load courses.");
      return courseLibraryQuery(userId);
    },
    enabled: Boolean(userId)
  });
}

export function useCourses(userId: string | undefined, filters: CourseFilterState = DEFAULT_FILTERS) {
  const debouncedSearch = useDebouncedValue(filters.search);
  const query = useCourseLibraryQuery(userId);

  const activeFilters = { ...filters, search: debouncedSearch };
  const filteredCourses = query.data
    ? filterCourses(query.data.courses, activeFilters)
    : [];

  return { ...query, filteredCourses, activeFilters };
}

export function useFeaturedCourse(userId: string | undefined) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => courseLibraryQuery(userId!),
    enabled: Boolean(userId),
    select: (data) => data.featuredCourse
  });
}

export function useLearningPaths(userId: string | undefined) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => courseLibraryQuery(userId!),
    enabled: Boolean(userId),
    select: (data) => data.learningPaths
  });
}

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => courseLibraryQuery(userId!),
    enabled: Boolean(userId),
    select: (data) => data.favorites
  });
}

export function useRecentlyViewed(userId: string | undefined) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => courseLibraryQuery(userId!),
    enabled: Boolean(userId),
    select: (data) => data.recentlyViewed
  });
}

export function useCategories(userId: string | undefined) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId],
    queryFn: () => courseLibraryQuery(userId!),
    enabled: Boolean(userId),
    select: (data) => data.categories
  });
}

export function useCoursesByCategory(userId: string | undefined, categoryId: string | null) {
  return useQuery({
    queryKey: [COURSE_LIBRARY_QUERY_KEY, userId, "category", categoryId],
    queryFn: () => coursesByCategoryQuery(userId!, categoryId!),
    enabled: Boolean(userId && categoryId)
  });
}

export function useToggleFavorite(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, isFavorite }: { courseId: string; isFavorite: boolean }) => {
      if (!userId) throw new Error("User is required.");
      return toggleFavoriteMutation(userId, courseId, isFavorite);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [COURSE_LIBRARY_QUERY_KEY, userId] });
    }
  });
}

export function useCourseLibrary(userId: string | undefined) {
  return useCourseLibraryQuery(userId);
}
