import { describe, expect, it } from "vitest";
import {
  isValidAudioUpload,
  isValidEmail,
  isValidFileUpload,
  isValidImageUpload,
  isValidPassword,
  isValidPhone,
  isValidSlug,
  isValidUrl,
  isValidUuid
} from "@/core/validators";

describe("core validators", () => {
  it("validates email addresses", () => {
    expect(isValidEmail("student@example.com")).toBe(true);
    expect(isValidEmail("invalid")).toBe(false);
  });

  it("validates strong passwords", () => {
    expect(isValidPassword("StrongPass123!")).toBe(true);
    expect(isValidPassword("weak")).toBe(false);
  });

  it("validates phone numbers", () => {
    expect(isValidPhone("+919876543210")).toBe(true);
    expect(isValidPhone("abc")).toBe(false);
  });

  it("validates urls slugs and uuids", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidSlug("money-reiki")).toBe(true);
    expect(isValidUuid("00000000-0000-4000-8000-000000000000")).toBe(true);
  });

  it("validates upload payloads", () => {
    expect(
      isValidImageUpload({ contentType: "image/png", size: 1000 })
    ).toBe(true);
    expect(
      isValidAudioUpload({ contentType: "audio/mpeg", size: 1000 })
    ).toBe(true);
    expect(
      isValidFileUpload({
        contentType: "application/pdf",
        size: 1000,
        fileName: "guide.pdf"
      })
    ).toBe(true);
  });
});
