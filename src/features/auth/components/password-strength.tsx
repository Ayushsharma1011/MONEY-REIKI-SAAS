"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import {
  getPasswordRules,
  getPasswordStrength
} from "@/features/auth/password";

export function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const rules = getPasswordRules(password);

  return (
    <div className="mt-3 space-y-3" aria-live="polite">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className="text-foreground font-medium">{strength.label}</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <motion.div
            className="bg-accent h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>
      <ul className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-2">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-center gap-2">
            {rule.valid ? (
              <CheckCircle2 className="text-primary size-3.5" aria-hidden />
            ) : (
              <Circle className="size-3.5" aria-hidden />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
