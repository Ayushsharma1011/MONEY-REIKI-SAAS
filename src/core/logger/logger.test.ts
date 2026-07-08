import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "@/core/logger/logger";

describe("core logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("redacts secret metadata keys", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");

    const logger = createLogger("test");
    logger.debug("Auth attempt", {
      password: "super-secret",
      token: "abc.def.ghi"
    });

    expect(debugSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          password: "[REDACTED]",
          token: "[REDACTED]"
        })
      })
    );
  });

  it("suppresses debug logs in production", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");

    const logger = createLogger("test");
    logger.debug("Hidden debug");

    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("writes info logs with metadata", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");

    const logger = createLogger("test");
    logger.info("User signed in", { userId: "user-1" });

    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        message: "User signed in",
        metadata: expect.objectContaining({
          scope: "test",
          userId: "user-1"
        })
      })
    );
  });
});
