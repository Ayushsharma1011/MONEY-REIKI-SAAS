import { DEFAULT_INSTRUCTOR, XP_PER_LESSON } from "@/features/courses/constants";
import type {
  LessonCardViewModel,
  LessonDisplayStatus,
  ModuleViewModel
} from "@/features/courses/detail-types";
import type { CourseModule, Lesson } from "@/types/core";

export const LESSON_UNLOCK_REQUIREMENT =
  "Complete the previous lesson to unlock this content.";

export const JOURNEY_LESSON_UNLOCK_REQUIREMENT =
  "Continue your daily journey to unlock this lesson.";

type OrderedLesson = {
  lesson: Lesson;
  moduleId: string;
  moduleOrder: number;
};

export function flattenCourseLessons(
  modules: CourseModule[],
  lessonsByModule: Map<string, Lesson[]>
): OrderedLesson[] {
  return [...modules]
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap((module) => {
      const lessons = lessonsByModule.get(module.id) ?? [];
      return lessons
        .sort((a, b) => a.order_index - b.order_index)
        .map((lesson) => ({
          lesson,
          moduleId: module.id,
          moduleOrder: module.order_index
        }));
    });
}

export function getLessonButtonLabel(
  status: LessonDisplayStatus,
  hasResume: boolean
): string {
  if (status === "completed") return "Completed";
  if (status === "locked") return "Locked";
  if (status === "resume" || (status === "current" && hasResume)) return "Resume";
  if (status === "current") return "Start";
  if (hasResume) return "Continue";
  return "Start";
}

export function mapLessonStatuses(
  orderedLessons: OrderedLesson[],
  completedLessonIds: Set<string>,
  resumeLessonIds: Set<string>,
  journeyCurrentLessonId: string | null
): LessonCardViewModel[] {
  let sequentialCurrentAssigned = false;

  return orderedLessons.map(({ lesson, moduleId }) => {
    const isCompleted = completedLessonIds.has(lesson.id);
    const hasResume = resumeLessonIds.has(lesson.id);
    const isJourneyCurrent = journeyCurrentLessonId === lesson.id;

    let status: LessonDisplayStatus;
    let unlockRequirement: string | null = null;

    if (isCompleted) {
      status = "completed";
    } else if (lesson.is_preview) {
      status = "preview";
    } else if (isJourneyCurrent) {
      status = hasResume ? "resume" : "current";
    } else if (!sequentialCurrentAssigned) {
      sequentialCurrentAssigned = true;
      status = hasResume ? "resume" : "current";
    } else {
      status = "locked";
      unlockRequirement = isJourneyCurrent
        ? JOURNEY_LESSON_UNLOCK_REQUIREMENT
        : LESSON_UNLOCK_REQUIREMENT;
    }

    const progressPercent = isCompleted ? 100 : hasResume ? 35 : 0;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      durationMinutes: lesson.duration,
      lessonType: lesson.lesson_type,
      thumbnailUrl: lesson.thumbnail,
      status,
      buttonLabel: getLessonButtonLabel(status, hasResume),
      progressPercent,
      isPreview: lesson.is_preview,
      unlockRequirement,
      moduleId,
      orderIndex: lesson.order_index
    };
  });
}

export function buildModuleViewModels(
  modules: CourseModule[],
  lessonCards: LessonCardViewModel[]
): ModuleViewModel[] {
  return [...modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((module) => {
      const lessons = lessonCards.filter((lesson) => lesson.moduleId === module.id);
      const completed = lessons.filter((lesson) => lesson.status === "completed").length;
      const completionPercent =
        lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        lessonCount: lessons.length,
        completionPercent,
        orderIndex: module.order_index,
        lessons
      };
    });
}

export function filterLessonsBySearch(
  lessons: LessonCardViewModel[],
  query: string
): LessonCardViewModel[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return lessons;
  return lessons.filter((lesson) =>
    [lesson.title, lesson.lessonType].join(" ").toLowerCase().includes(normalized)
  );
}

export function buildOverviewContent(
  description: string | null,
  level: string,
  moduleTitles: string[]
) {
  const baseDescription =
    description ?? "Transform your relationship with abundance through guided Money Reiki practices.";

  return {
    description: baseDescription,
    whatYouWillLearn: moduleTitles.slice(0, 5).map((title) => `Master ${title.toLowerCase()}`),
    whoIsThisFor:
      level === "beginner"
        ? [
            "Students beginning their Money Reiki journey",
            "Anyone seeking daily abundance rituals",
            "Learners who prefer guided step-by-step paths"
          ]
        : [
            "Practitioners ready to deepen their transformation",
            "Students continuing their abundance journey",
            "Learners committed to consistent daily practice"
          ],
    prerequisites:
      level === "beginner"
        ? ["An open mind and willingness to practice daily"]
        : ["Completion of foundational Money Reiki practices recommended"],
    skillsYouWillBuild: [
      "Abundance mindset",
      "Daily ritual consistency",
      "Energy alignment",
      "Financial consciousness"
    ]
  };
}

export function calculateCourseXpReward(lessonCount: number, durationMinutes: number): number {
  return Math.max(lessonCount * XP_PER_LESSON, Math.round(durationMinutes / 10) * 5);
}

export function findContinueLesson(
  lessons: LessonCardViewModel[]
): LessonCardViewModel | null {
  return (
    lessons.find((lesson) => lesson.status === "resume") ??
    lessons.find((lesson) => lesson.status === "current") ??
    lessons.find((lesson) => lesson.status === "preview" && lesson.progressPercent > 0) ??
    null
  );
}

export { DEFAULT_INSTRUCTOR };
