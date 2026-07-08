import { z } from "zod";

export const uuidValidator = z.string().uuid("Enter a valid UUID.");

export function isValidUuid(value: string): boolean {
  return uuidValidator.safeParse(value).success;
}

export function parseUuid(value: string): string {
  return uuidValidator.parse(value);
}
