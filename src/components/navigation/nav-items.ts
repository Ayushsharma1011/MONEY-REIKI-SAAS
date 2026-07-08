import { Home, LayoutDashboard } from "lucide-react";
import { ROUTES } from "@/constants/app";
import type { NavItem } from "@/types";

export const publicNavItems: NavItem[] = [
  { title: "Home", href: ROUTES.home, icon: Home }
];

export const dashboardNavItems: NavItem[] = [
  { title: "Overview", href: ROUTES.dashboard, icon: LayoutDashboard }
];
