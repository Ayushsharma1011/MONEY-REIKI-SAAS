import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { EmptyStateCard, ErrorStateCard } from "@/features/dashboard/components/empty-state-card";

describe("dashboard components", () => {
  it("renders loading skeleton", () => {
    const html = renderToStaticMarkup(<DashboardSkeleton />);
    expect(html).toContain("Loading dashboard");
  });

  it("renders empty and error states", () => {
    const empty = renderToStaticMarkup(
      <EmptyStateCard
        actionLabel="Try again"
        description="No course yet"
        title="Empty"
      />
    );
    const error = renderToStaticMarkup(
      <ErrorStateCard onRetry={() => undefined} />
    );

    expect(empty).toContain("Empty");
    expect(error).toContain("Something went wrong");
    expect(error).toContain("Retry");
  });
});
