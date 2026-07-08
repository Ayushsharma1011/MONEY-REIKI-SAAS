import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

vi.mock("@/features/courses/service", () => ({
  createCourseDetailsServices: vi.fn()
}));

describe("courseDetailsQuery", () => {
  it("throws not found for missing courses", async () => {
    const { createCourseDetailsServices } = await import("@/features/courses/service");
    vi.mocked(createCourseDetailsServices).mockReturnValue({
      courses: {
        getCourseBySlug: vi.fn().mockRejectedValue(new NotFoundError("Course was not found."))
      }
    } as never);

    const { courseDetailsQuery } = await import("@/features/courses/detail-queries");
    await expect(courseDetailsQuery("user-1", "missing-course")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
