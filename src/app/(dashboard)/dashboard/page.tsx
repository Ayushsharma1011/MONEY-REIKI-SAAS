import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ChartPlaceholder } from "@/components/charts/chart-placeholder";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/app";

export default function DashboardShellPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ title: "Dashboard", href: ROUTES.dashboard }]} />
      <div>
        <h1 className="text-2xl font-semibold">Dashboard shell</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Application chrome is ready. Product workflows begin in later modules.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace status</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No module installed"
              description="MR-001 stops at the enterprise foundation layer."
            />
          </CardContent>
        </Card>
        <ChartPlaceholder />
      </div>
    </div>
  );
}
