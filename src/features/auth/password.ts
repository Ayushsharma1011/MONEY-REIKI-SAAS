import type {
  PasswordRule,
  PasswordStrengthLabel
} from "@/features/auth/types";

export const PASSWORD_MIN_LENGTH = 12;

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: "length",
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      valid: password.length >= PASSWORD_MIN_LENGTH
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password)
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      valid: /[a-z]/.test(password)
    },
    { id: "number", label: "One number", valid: /\d/.test(password) },
    {
      id: "special",
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password)
    }
  ];
}

export function getPasswordStrength(password: string) {
  const score = getPasswordRules(password).filter((rule) => rule.valid).length;
  const labels: PasswordStrengthLabel[] = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Excellent"
  ];

  return {
    score,
    label: labels[Math.max(0, score - 1)] ?? "Very Weak",
    percentage: score * 20
  };
}

export function isStrongPassword(password: string) {
  return getPasswordRules(password).every((rule) => rule.valid);
}
