import { z } from "zod";

export const emailValidator = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email is too long.");

export function isValidEmail(value: string): boolean {
  return emailValidator.safeParse(value).success;
}

export function parseEmail(value: string): string {
  return emailValidator.parse(value);
}
