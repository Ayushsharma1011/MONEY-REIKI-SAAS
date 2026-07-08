"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/app";
import { signOut } from "@/features/auth/service";
import { useUserStore } from "@/stores/user-store";

export function LogoutButton() {
  const router = useRouter();
  const reset = useUserStore((state) => state.reset);

  async function onLogout() {
    const result = await signOut();

    if (result.error) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success("Logged out.");
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
      <LogOut className="size-4" aria-hidden />
    </Button>
  );
}
