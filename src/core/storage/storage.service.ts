import { storageConfig, type StorageRule } from "@/core/config/storage.config";
import type { PlatformStorageBucket } from "@/core/constants/platform.constants";
import { ValidationError } from "@/lib/errors";

export type StorageUploadInput = {
  bucket: PlatformStorageBucket;
  path: string;
  file: Blob | File | ArrayBuffer;
  contentType: string;
  size: number;
};

export type StorageClient = {
  upload: (
    bucket: string,
    path: string,
    file: Blob | File | ArrayBuffer,
    options?: { contentType?: string; upsert?: boolean }
  ) => Promise<{ error: Error | null }>;
  remove: (bucket: string, paths: string[]) => Promise<{ error: Error | null }>;
  getPublicUrl: (bucket: string, path: string) => string;
  createSignedUrl: (
    bucket: string,
    path: string,
    expiresIn: number
  ) => Promise<{ data: { signedUrl: string } | null; error: Error | null }>;
};

export class StorageService {
  constructor(private readonly client: StorageClient) {}

  getBucketRule(bucket: PlatformStorageBucket): StorageRule {
    return storageConfig[bucket];
  }

  validateUpload(input: StorageUploadInput): void {
    const rule = this.getBucketRule(input.bucket);

    if (input.size > rule.maxBytes) {
      throw new ValidationError("File exceeds the maximum allowed size.", {
        bucket: input.bucket,
        maxBytes: rule.maxBytes
      });
    }

    if (!rule.allowedTypes.includes(input.contentType)) {
      throw new ValidationError("File type is not allowed for this bucket.", {
        bucket: input.bucket,
        contentType: input.contentType,
        allowedTypes: rule.allowedTypes
      });
    }
  }

  async upload(input: StorageUploadInput): Promise<void> {
    this.validateUpload(input);

    const { error } = await this.client.upload(input.bucket, input.path, input.file, {
      contentType: input.contentType,
      upsert: true
    });

    if (error) {
      throw error;
    }
  }

  async delete(bucket: PlatformStorageBucket, path: string): Promise<void> {
    const { error } = await this.client.remove(bucket, [path]);

    if (error) {
      throw error;
    }
  }

  getPublicUrl(bucket: PlatformStorageBucket, path: string): string {
    const rule = this.getBucketRule(bucket);

    if (!rule.public) {
      throw new ValidationError("Bucket does not allow public URLs.", { bucket });
    }

    return this.client.getPublicUrl(bucket, path);
  }

  async getSignedUrl(
    bucket: PlatformStorageBucket,
    path: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const { data, error } = await this.client.createSignedUrl(
      bucket,
      path,
      expiresInSeconds
    );

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Failed to create signed URL.");
    }

    return data.signedUrl;
  }

  isPublicBucket(bucket: PlatformStorageBucket): boolean {
    return this.getBucketRule(bucket).public;
  }
}

export function createStoragePath(
  userId: string,
  fileName: string,
  prefix?: string
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const segments = [prefix, userId, `${Date.now()}_${safeName}`].filter(Boolean);
  return segments.join("/");
}
