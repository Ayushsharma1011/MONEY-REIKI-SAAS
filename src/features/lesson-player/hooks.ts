"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  COURSE_DETAILS_QUERY_KEY,
  COURSE_LIBRARY_QUERY_KEY,
  LESSON_BOOKMARKS_QUERY_KEY,
  LESSON_NOTES_QUERY_KEY,
  LESSON_PLAYER_QUERY_KEY,
  LESSON_RESOURCES_QUERY_KEY,
  RESUME_SAVE_INTERVAL_MS
} from "@/features/courses/constants";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/constants";
import { DAILY_RITUAL_QUERY_KEY } from "@/features/journey/constants";
import {
  completeLessonMutation,
  createBookmarkMutation,
  createLessonNoteMutation,
  deleteBookmarkMutation,
  deleteLessonNoteMutation,
  editLessonNoteMutation,
  lessonBookmarksQuery,
  lessonNotesQuery,
  lessonPlayerQuery,
  lessonResourcesQuery,
  saveLessonResumeMutation
} from "@/features/lesson-player/queries";
import type {
  CompleteLessonResult,
  LessonPlayerViewModel
} from "@/features/lesson-player/types";
import { useCallback, useEffect, useRef } from "react";

export function useLesson(
  userId: string | undefined,
  courseSlug: string,
  lessonSlug: string
) {
  return useQuery<LessonPlayerViewModel, Error>({
    queryKey: [LESSON_PLAYER_QUERY_KEY, userId, courseSlug, lessonSlug],
    queryFn: () => {
      if (!userId) throw new Error("User is required.");
      return lessonPlayerQuery(userId, courseSlug, lessonSlug);
    },
    enabled: Boolean(userId && courseSlug && lessonSlug),
    retry: (_, error) => !error.message.toLowerCase().includes("not found")
  });
}

export function useLessonNotes(
  userId: string | undefined,
  lessonId: string | undefined
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [LESSON_NOTES_QUERY_KEY, userId, lessonId],
    queryFn: () => lessonNotesQuery(userId!, lessonId!),
    enabled: Boolean(userId && lessonId)
  });

  const createNote = useMutation({
    mutationFn: (content: string) => {
      if (!userId || !lessonId) throw new Error("User and lesson are required.");
      return createLessonNoteMutation(userId, lessonId, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_NOTES_QUERY_KEY, userId, lessonId]
      });
    }
  });

  const editNote = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) => {
      if (!userId) throw new Error("User is required.");
      return editLessonNoteMutation(userId, noteId, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_NOTES_QUERY_KEY, userId, lessonId]
      });
    }
  });

  const removeNote = useMutation({
    mutationFn: (noteId: string) => {
      if (!userId) throw new Error("User is required.");
      return deleteLessonNoteMutation(userId, noteId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_NOTES_QUERY_KEY, userId, lessonId]
      });
    }
  });

  return { ...query, createNote, editNote, removeNote };
}

export function useLessonBookmarks(
  userId: string | undefined,
  lessonId: string | undefined
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [LESSON_BOOKMARKS_QUERY_KEY, userId, lessonId],
    queryFn: () => lessonBookmarksQuery(userId!, lessonId!),
    enabled: Boolean(userId && lessonId)
  });

  const addBookmark = useMutation({
    mutationFn: (input: { timestampSeconds: number; note?: string }) => {
      if (!userId || !lessonId) throw new Error("User and lesson are required.");
      return createBookmarkMutation(userId, {
        lesson_id: lessonId,
        timestamp_seconds: input.timestampSeconds,
        note: input.note ?? null
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_BOOKMARKS_QUERY_KEY, userId, lessonId]
      });
    }
  });

  const removeBookmark = useMutation({
    mutationFn: (bookmarkId: string) => {
      if (!userId) throw new Error("User is required.");
      return deleteBookmarkMutation(userId, bookmarkId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_BOOKMARKS_QUERY_KEY, userId, lessonId]
      });
    }
  });

  return { ...query, addBookmark, removeBookmark };
}

export function useLessonResources(lessonId: string | undefined) {
  return useQuery({
    queryKey: [LESSON_RESOURCES_QUERY_KEY, lessonId],
    queryFn: () => lessonResourcesQuery(lessonId!),
    enabled: Boolean(lessonId)
  });
}

type ResumeState = {
  positionSeconds: number;
  watchTimeSeconds: number;
  playbackSpeed: number;
};

export function useLessonResume(
  userId: string | undefined,
  lessonId: string | undefined,
  initial: ResumeState
) {
  const stateRef = useRef<ResumeState>(initial);

  useEffect(() => {
    stateRef.current = initial;
  }, [initial]);

  const persist = useCallback(async () => {
    if (!userId || !lessonId) return;
    const current = stateRef.current;
    await saveLessonResumeMutation(userId, {
      lessonId,
      positionSeconds: current.positionSeconds,
      watchTimeSeconds: current.watchTimeSeconds,
      playbackSpeed: current.playbackSpeed
    });
  }, [lessonId, userId]);

  useEffect(() => {
    if (!userId || !lessonId) return undefined;
    const interval = window.setInterval(() => {
      void persist();
    }, RESUME_SAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [lessonId, persist, userId]);

  const updateState = useCallback((next: Partial<ResumeState>) => {
    stateRef.current = { ...stateRef.current, ...next };
  }, []);

  const saveNow = useCallback(async () => {
    await persist();
  }, [persist]);

  return { updateState, saveNow };
}

export function useCompleteLesson(
  userId: string | undefined,
  courseSlug: string,
  lessonSlug: string
) {
  const queryClient = useQueryClient();

  return useMutation<
    CompleteLessonResult,
    Error,
    {
      lessonId: string;
      watchTimeSeconds: number;
      journeyTaskId: string | null;
      journeyId: string | null;
      xpAmount: number;
    }
  >({
    mutationFn: (input) => {
      if (!userId) throw new Error("User is required.");
      return completeLessonMutation(userId, {
        ...input,
        courseSlug,
        lessonSlug
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [LESSON_PLAYER_QUERY_KEY, userId, courseSlug, lessonSlug]
      });
      void queryClient.invalidateQueries({
        queryKey: [COURSE_DETAILS_QUERY_KEY, userId, courseSlug]
      });
      void queryClient.invalidateQueries({ queryKey: [COURSE_LIBRARY_QUERY_KEY, userId] });
      void queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY, userId] });
      void queryClient.invalidateQueries({ queryKey: [DAILY_RITUAL_QUERY_KEY, userId] });
    }
  });
}
