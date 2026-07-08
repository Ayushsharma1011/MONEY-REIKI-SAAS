import type {
  LessonCardViewModel,
  ModuleViewModel
} from "@/features/courses/detail-types";
import type { LessonResourceType, VideoProviderName } from "@/types/learning";

export type LessonAccessState = "available" | "locked" | "missing" | "preview";

export type LessonVideoState = "ready" | "none" | "processing" | "error";

export type LessonPlayerHeaderViewModel = {
  title: string;
  moduleTitle: string;
  lessonNumber: number;
  totalLessons: number;
  journeyDay: number | null;
  xpReward: number;
  difficulty: string;
  estimatedMinutes: number;
  lessonType: string;
};

export type LessonVideoViewModel = {
  state: LessonVideoState;
  url: string | null;
  thumbnailUrl: string | null;
  provider: VideoProviderName | null;
  durationSeconds: number;
  resumePositionSeconds: number;
  playbackSpeed: number;
  errorMessage: string | null;
};

export type LessonSidebarViewModel = {
  courseTitle: string;
  courseSlug: string;
  progressPercent: number;
  currentModuleTitle: string;
  journeyDay: number | null;
  journeyProgressPercent: number;
  journeyTitle: string | null;
  modules: ModuleViewModel[];
  currentLessonId: string;
};

export type NextLessonViewModel = {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  xpReward: number;
};

export type LessonResourceViewModel = {
  id: string;
  title: string;
  resourceType: LessonResourceType;
  url: string | null;
  filePath: string | null;
};

export type GroupedResourcesViewModel = {
  pdf: LessonResourceViewModel[];
  zip: LessonResourceViewModel[];
  image: LessonResourceViewModel[];
  link: LessonResourceViewModel[];
  external: LessonResourceViewModel[];
};

export type LessonNoteViewModel = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonBookmarkViewModel = {
  id: string;
  timestampSeconds: number;
  note: string | null;
  formattedTime: string;
};

export type LessonPlayerViewModel = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lessonId: string;
  lessonSlug: string;
  accessState: LessonAccessState;
  header: LessonPlayerHeaderViewModel;
  video: LessonVideoViewModel;
  overview: {
    description: string | null;
  };
  sidebar: LessonSidebarViewModel;
  nextLesson: NextLessonViewModel | null;
  journeyTaskId: string | null;
  journeyId: string | null;
  isCompleted: boolean;
  watchTimeSeconds: number;
  allLessons: LessonCardViewModel[];
};

export type CompleteLessonResult = {
  xpAwarded: number;
  nextLesson: NextLessonViewModel | null;
  journeyProgressPercent: number | null;
};

export type VideoPlayerRef = {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};
