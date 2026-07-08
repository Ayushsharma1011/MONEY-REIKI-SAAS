import { z } from "zod";

export const phoneValidator = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number.");

export function isValidPhone(value: string): boolean {
  return phoneValidator.safeParse(value).success;
}

export function parsePhone(value: string): string {
  return phoneValidator.parse(value);
}
