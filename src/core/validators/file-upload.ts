import { z } from "zod";

const FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/zip",
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "video/mp4"
] as const;

const MAX_FILE_BYTES = 250_000_000;

export const fileUploadValidator = z.object({
  contentType: z.enum(FILE_TYPES),
  size: z.number().int().positive().max(MAX_FILE_BYTES),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[^\\/:*?"<>|]+$/, "File name contains invalid characters.")
});

export type FileUploadInput = z.infer<typeof fileUploadValidator>;

export function isValidFileUpload(input: FileUploadInput): boolean {
  return fileUploadValidator.safeParse(input).success;
}

export function parseFileUpload(input: FileUploadInput): FileUploadInput {
  return fileUploadValidator.parse(input);
}
