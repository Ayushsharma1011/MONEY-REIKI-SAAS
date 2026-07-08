"use client";

import { Settings, Zap } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/features/dashboard/components/notification-bell";
import type { DashboardGreeting } from "@/features/dashboard/types";

export function DashboardHeader({
  greeting,
  profileName,
  avatarUrl,
  unreadNotifications,
  journeyTitle,
  currentDay,
  currentLevel,
  currentXp
}: {
  greeting: DashboardGreeting;
  profileName: string;
  avatarUrl: string | null;
  unreadNotifications: number;
  journeyTitle?: string | null;
  currentDay?: number | null;
  currentLevel?: number | null;
  currentXp?: number | null;
}) {
  return (
    <header className="bg-background/80 sticky top-0 z-30 -mx-4 border-b px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{greeting.dateLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting.label}, {greeting.firstName}
          </h1>
          {journeyTitle ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                {journeyTitle}
              </span>
              {currentDay ? (
                <span className="text-muted-foreground text-xs">Day {currentDay}</span>
              ) : null}
              {currentLevel ? (
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Zap className="text-accent size-3" aria-hidden />
                  Lvl {currentLevel}
                  {typeof currentXp === "number" ? ` · ${currentXp} XP` : null}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              {greeting.quote}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell count={unreadNotifications} />
          <Link
            aria-label="Settings"
            className="bg-card/80 hover:bg-muted inline-flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors"
            href="#profile"
          >
            <Settings className="size-4" aria-hidden />
          </Link>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={profileName}
              className="size-10 rounded-full border object-cover"
              src={avatarUrl}
            />
          ) : (
            <Avatar name={profileName} />
          )}
        </div>
      </div>
    </header>
  );
}
