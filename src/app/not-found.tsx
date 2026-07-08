import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ROUTES } from "@/constants/app";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        action={
          <Button asChild>
            <Link href={ROUTES.home}>Return home</Link>
          </Button>
        }
      />
    </main>
  );
}
