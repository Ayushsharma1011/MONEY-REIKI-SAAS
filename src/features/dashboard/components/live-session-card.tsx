"use client";

import { motion } from "framer-motion";
import { CalendarClock, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardLiveSession } from "@/features/dashboard/types";

function formatCountdown(targetIso: string): string {
  const diffMs = new Date(targetIso).getTime() - Date.now();

  if (diffMs <= 0) {
    return "Starting soon";
  }

  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const seconds = Math.floor((diffMs % 60_000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function LiveSessionCard({ session }: { session: DashboardLiveSession }) {
  const [countdown, setCountdown] = useState(formatCountdown(session.startsAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(session.startsAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session.startsAt]);

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.18, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Video className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Upcoming Live Session
        </h2>
      </div>
      <h3 className="text-lg font-semibold">{session.title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Facilitator: {session.facilitator}
      </p>
      <div className="text-accent mt-4 flex items-center gap-2 text-sm font-medium">
        <CalendarClock className="size-4" aria-hidden />
        {countdown}
      </div>
      <Button className="mt-5">Join Session</Button>
    </motion.article>
  );
}
