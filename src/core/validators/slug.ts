import { z } from "zod";

export const slugValidator = z
  .string()
  .trim()
  .min(2, "Slug is too short.")
  .max(120, "Slug is too long.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens.");

export function isValidSlug(value: string): boolean {
  return slugValidator.safeParse(value).success;
}

export function parseSlug(value: string): string {
  return slugValidator.parse(value);
}
