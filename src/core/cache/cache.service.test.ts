import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryCacheService } from "@/core/cache/cache.service";

describe("MemoryCacheService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves namespaced values", () => {
    const cache = new MemoryCacheService({ namespace: "auth" });

    cache.set("session", { id: "abc" });

    expect(cache.get("session")).toEqual({ id: "abc" });
  });

  it("expires values after ttl", () => {
    vi.useFakeTimers();
    const cache = new MemoryCacheService({ namespace: "auth" });

    cache.set("session", "value", 1000);
    vi.advanceTimersByTime(1001);

    expect(cache.get("session")).toBeUndefined();
  });

  it("deletes and clears entries", () => {
    const cache = new MemoryCacheService({ namespace: "auth" });

    cache.set("one", 1);
    cache.set("two", 2);

    expect(cache.delete("one")).toBe(true);
    expect(cache.get("one")).toBeUndefined();

    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
