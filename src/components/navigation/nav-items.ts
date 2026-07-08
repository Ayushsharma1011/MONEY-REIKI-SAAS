import {
  BookOpen,
  Home,
  LayoutDashboard,
  NotebookPen,
  Sparkles,
  UserRound
} from "lucide-react";
import { ROUTES } from "@/constants/app";
import type { NavItem } from "@/types";

export const publicNavItems: NavItem[] = [
  { title: "Home", href: ROUTES.home, icon: Home }
];

export const dashboardNavItems: NavItem[] = [
  { title: "Home", href: ROUTES.dashboard, icon: LayoutDashboard },
  { title: "Courses", href: `${ROUTES.dashboard}#courses`, icon: BookOpen },
  { title: "Practice", href: `${ROUTES.dashboard}#practice`, icon: Sparkles },
  { title: "Journal", href: `${ROUTES.dashboard}#journal`, icon: NotebookPen },
  { title: "Profile", href: `${ROUTES.dashboard}#profile`, icon: UserRound }
];
