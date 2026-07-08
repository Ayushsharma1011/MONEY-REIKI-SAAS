import { describe, expect, it, vi } from "vitest";
import {
  StorageService,
  createStoragePath,
  type StorageClient
} from "@/core/storage/storage.service";
import { ValidationError } from "@/lib/errors";

function createMockClient(): StorageClient {
  return {
    upload: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue("https://cdn.example.com/avatars/user.png"),
    createSignedUrl: vi
      .fn()
      .mockResolvedValue({ data: { signedUrl: "https://signed.example.com/file" }, error: null })
  };
}

describe("StorageService", () => {
  it("validates upload size and content type", () => {
    const service = new StorageService(createMockClient());

    expect(() =>
      service.validateUpload({
        bucket: "avatars",
        path: "user.png",
        file: new Blob(),
        contentType: "application/pdf",
        size: 1000
      })
    ).toThrow(ValidationError);
  });

  it("uploads valid files", async () => {
    const client = createMockClient();
    const service = new StorageService(client);

    await service.upload({
      bucket: "avatars",
      path: "user.png",
      file: new Blob(),
      contentType: "image/png",
      size: 1000
    });

    expect(client.upload).toHaveBeenCalled();
  });

  it("returns public urls for public buckets", () => {
    const client = createMockClient();
    const service = new StorageService(client);

    expect(service.getPublicUrl("avatars", "user.png")).toBe(
      "https://cdn.example.com/avatars/user.png"
    );
  });

  it("creates signed urls", async () => {
    const client = createMockClient();
    const service = new StorageService(client);

    await expect(service.getSignedUrl("journal-images", "entry.png")).resolves.toBe(
      "https://signed.example.com/file"
    );
  });

  it("builds storage paths", () => {
    expect(createStoragePath("user-1", "photo.png", "uploads")).toMatch(
      /^uploads\/user-1\/\d+_photo\.png$/
    );
  });
});
