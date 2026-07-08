import { z } from "zod";

const PASSWORD_MIN_LENGTH = 12;

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const passwordValidator = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .regex(
    strongPasswordPattern,
    "Password must include uppercase, lowercase, number, and special character."
  );

export function isValidPassword(value: string): boolean {
  return passwordValidator.safeParse(value).success;
}

export function parsePassword(value: string): string {
  return passwordValidator.parse(value);
}
