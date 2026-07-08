import { z } from "zod";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
const MAX_IMAGE_BYTES = 5_000_000;

export const imageUploadValidator = z.object({
  contentType: z.enum(IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_IMAGE_BYTES)
});

export type ImageUploadInput = z.infer<typeof imageUploadValidator>;

export function isValidImageUpload(input: ImageUploadInput): boolean {
  return imageUploadValidator.safeParse(input).success;
}

export function parseImageUpload(input: ImageUploadInput): ImageUploadInput {
  return imageUploadValidator.parse(input);
}
