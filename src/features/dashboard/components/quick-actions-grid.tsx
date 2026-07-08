"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { DashboardViewModel } from "@/features/dashboard/types";

export function QuickActionsGrid({
  actions
}: {
  actions: DashboardViewModel["quickActions"];
}) {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2
        className="mb-3 text-sm font-semibold tracking-wide uppercase"
        id="quick-actions-title"
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              key={action.id}
              transition={{ delay: 0.04 * index, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                className="bg-card/80 hover:border-accent/40 flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center shadow-sm backdrop-blur-sm transition-colors"
                href={action.href}
              >
                <Icon className="text-accent size-5" aria-hidden />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
