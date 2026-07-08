import { z } from "zod";

const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"] as const;
const MAX_AUDIO_BYTES = 50_000_000;

export const audioUploadValidator = z.object({
  contentType: z.enum(AUDIO_TYPES),
  size: z.number().int().positive().max(MAX_AUDIO_BYTES)
});

export type AudioUploadInput = z.infer<typeof audioUploadValidator>;

export function isValidAudioUpload(input: AudioUploadInput): boolean {
  return audioUploadValidator.safeParse(input).success;
}

export function parseAudioUpload(input: AudioUploadInput): AudioUploadInput {
  return audioUploadValidator.parse(input);
}
