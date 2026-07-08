import { z } from "zod";

export const urlValidator = z.string().trim().url("Enter a valid URL.");

export function isValidUrl(value: string): boolean {
  return urlValidator.safeParse(value).success;
}

export function parseUrl(value: string): string {
  return urlValidator.parse(value);
}
