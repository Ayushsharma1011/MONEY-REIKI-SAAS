import type { PlatformStorageBucket } from "@/core/constants/platform.constants";

export type StorageRule = {
  bucket: PlatformStorageBucket;
  maxBytes: number;
  allowedTypes: string[];
  public: boolean;
};

/** Storage bucket rules used for validation before uploads. */
export const storageConfig: Record<PlatformStorageBucket, StorageRule> = {
  avatars: { bucket: "avatars", maxBytes: 2_000_000, allowedTypes: ["image/png", "image/jpeg", "image/webp"], public: true },
  "journal-images": { bucket: "journal-images", maxBytes: 5_000_000, allowedTypes: ["image/png", "image/jpeg", "image/webp"], public: false },
  "wish-box": { bucket: "wish-box", maxBytes: 5_000_000, allowedTypes: ["image/png", "image/jpeg", "image/webp"], public: false },
  "vision-board": { bucket: "vision-board", maxBytes: 5_000_000, allowedTypes: ["image/png", "image/jpeg", "image/webp"], public: false },
  "lesson-assets": { bucket: "lesson-assets", maxBytes: 250_000_000, allowedTypes: ["video/mp4", "audio/mpeg", "image/png", "image/jpeg"], public: false },
  "course-thumbnails": { bucket: "course-thumbnails", maxBytes: 4_000_000, allowedTypes: ["image/png", "image/jpeg", "image/webp"], public: true },
  certificates: { bucket: "certificates", maxBytes: 8_000_000, allowedTypes: ["application/pdf", "image/png"], public: false }
};
