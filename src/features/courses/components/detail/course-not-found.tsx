"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { BookX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/app";

function CourseNotFoundComponent() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      role="alert"
    >
      <div className="bg-muted/50 mb-6 flex size-20 items-center justify-center rounded-full">
        <BookX className="text-muted-foreground size-10" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold">Course Not Found</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
        This course doesn&apos;t exist or may have been moved. Explore our library to continue
        your transformation journey.
      </p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.courses}>Browse Course Library</Link>
      </Button>
    </motion.div>
  );
}

export const CourseNotFound = memo(CourseNotFoundComponent);
CourseNotFound.displayName = "CourseNotFound";
