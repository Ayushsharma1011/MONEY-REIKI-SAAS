import { CourseDetailsPage } from "@/features/courses/components/detail/course-details-page";

type PageProps = {
  params: Promise<{ courseSlug: string }>;
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseSlug } = await params;
  return <CourseDetailsPage courseSlug={courseSlug} />;
}
