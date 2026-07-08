import { LessonPlayer } from "@/features/lesson-player/components/lesson-player";

type PageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export default async function LessonPlayerPage({ params }: PageProps) {
  const { courseSlug, lessonSlug } = await params;
  return <LessonPlayer courseSlug={courseSlug} lessonSlug={lessonSlug} />;
}
