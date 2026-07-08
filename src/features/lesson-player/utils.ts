import type { GroupedResourcesViewModel, LessonResourceViewModel } from "@/features/lesson-player/types";
import type { LessonResource, LessonResourceType } from "@/types/learning";

export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function mapLessonResource(resource: LessonResource): LessonResourceViewModel {
  return {
    id: resource.id,
    title: resource.title,
    resourceType: resource.resource_type,
    url: resource.url,
    filePath: resource.file_path
  };
}

export function groupResourcesByType(
  resources: LessonResourceViewModel[]
): GroupedResourcesViewModel {
  const grouped: GroupedResourcesViewModel = {
    pdf: [],
    zip: [],
    image: [],
    link: [],
    external: []
  };

  for (const resource of resources) {
    grouped[resource.resourceType].push(resource);
  }

  return grouped;
}

export function resourceTypeLabel(type: LessonResourceType): string {
  const labels: Record<LessonResourceType, string> = {
    pdf: "PDF Documents",
    zip: "Downloads",
    image: "Images",
    link: "Links",
    external: "External Links"
  };
  return labels[type];
}

export function clampPlaybackSpeed(speed: number): number {
  return Math.min(2, Math.max(0.5, speed));
}
