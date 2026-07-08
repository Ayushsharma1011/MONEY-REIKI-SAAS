import {
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Heart,
  NotebookPen,
  Radio,
  Sparkles,
  Star,
  Target
} from "lucide-react";
import type { JourneyTaskMeta, JourneyTaskStatus, JourneyTaskViewModel } from "@/features/journey/types";
import type { DailyMission, JourneyTask, JourneyTaskType } from "@/types/journey";

const TASK_META: Record<JourneyTaskType, JourneyTaskMeta> = {
  lesson: { icon: GraduationCap, label: "Lesson", difficulty: "Beginner" },
  practice: { icon: Sparkles, label: "Practice", difficulty: "Beginner" },
  meditation: { icon: Brain, label: "Meditation", difficulty: "Calm" },
  journal: { icon: NotebookPen, label: "Journal", difficulty: "Reflective" },
  wish_box: { icon: Heart, label: "Wish Box", difficulty: "Creative" },
  vision_board: { icon: BookOpen, label: "Vision Board", difficulty: "Creative" },
  affirmation: { icon: Star, label: "Affirmation", difficulty: "Mindful" },
  challenge: { icon: Flame, label: "Challenge", difficulty: "Intermediate" },
  live_session: { icon: Radio, label: "Live Session", difficulty: "Interactive" }
};

export function getTaskMeta(taskType: JourneyTaskType): JourneyTaskMeta {
  return TASK_META[taskType];
}

export function mapTaskStatuses(
  tasks: JourneyTask[],
  completedTaskIds: Set<string>,
  journeyDifficulty = "beginner"
): JourneyTaskViewModel[] {
  const sorted = [...tasks].sort((a, b) => a.order_index - b.order_index);
  let currentAssigned = false;

  return sorted.map((task) => {
    const difficulty =
      journeyDifficulty.charAt(0).toUpperCase() + journeyDifficulty.slice(1);

    if (completedTaskIds.has(task.id)) {
      return {
        id: task.id,
        taskType: task.task_type,
        title: task.title,
        description: task.description,
        estimatedMinutes: task.estimated_minutes,
        difficulty,
        status: "completed" as JourneyTaskStatus,
        orderIndex: task.order_index
      };
    }

    if (!currentAssigned) {
      currentAssigned = true;
      return {
        id: task.id,
        taskType: task.task_type,
        title: task.title,
        description: task.description,
        estimatedMinutes: task.estimated_minutes,
        difficulty,
        status: "current" as JourneyTaskStatus,
        orderIndex: task.order_index
      };
    }

    return {
      id: task.id,
      taskType: task.task_type,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimated_minutes,
      difficulty,
      status: "locked" as JourneyTaskStatus,
      orderIndex: task.order_index
    };
  });
}

export function getTaskButtonLabel(status: JourneyTaskStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "current":
      return "Start";
    case "available":
      return "Continue";
    case "locked":
      return "Locked";
    default:
      return "Start";
  }
}

export function getTaskButtonLabelWithProgress(
  status: JourneyTaskStatus,
  hasPartialProgress = false
): string {
  if (status === "completed") return "Completed";
  if (status === "locked") return "Locked";
  if (status === "current" && hasPartialProgress) return "Resume";
  if (status === "current") return "Start";
  if (status === "available" && hasPartialProgress) return "Resume";
  return "Continue";
}

export function calculateTodayCompletion(
  tasks: JourneyTaskViewModel[]
): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

export function calculateXpEarnedToday(
  tasks: JourneyTaskViewModel[],
  xpPerTask: number
): number {
  return tasks.filter((task) => task.status === "completed").length * xpPerTask;
}

export function isDayCompleted(mission: DailyMission | null): boolean {
  if (!mission || mission.tasks.length === 0) return false;
  return mission.remainingTasks === 0;
}

export function buildRewardPreview(dayNumber: number, rewardXp: number): string {
  return `Day ${dayNumber} reward · +${rewardXp} XP`;
}

export function pickMotivationGradient(seed: number): string {
  const gradients = [
    "from-violet-500/20 via-fuchsia-500/10 to-amber-500/20",
    "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    "from-rose-500/20 via-orange-500/10 to-yellow-500/20",
    "from-indigo-500/20 via-purple-500/10 to-pink-500/20",
    "from-sky-500/20 via-blue-500/10 to-indigo-500/20"
  ];
  return gradients[seed % gradients.length] as string;
}

export function getEmptyStateType(
  hasActiveJourney: boolean,
  hasMission: boolean,
  hasProgress: boolean
): "no-journey" | "no-mission" | "no-progress" | "ready" {
  if (!hasActiveJourney) return "no-journey";
  if (!hasMission) return "no-mission";
  if (!hasProgress) return "no-progress";
  return "ready";
}

export { Target };
