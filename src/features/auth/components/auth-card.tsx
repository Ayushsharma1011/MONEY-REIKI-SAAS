"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "bg-card/82 shadow-primary/10 w-full rounded-lg border p-6 shadow-2xl backdrop-blur-xl sm:p-8",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
