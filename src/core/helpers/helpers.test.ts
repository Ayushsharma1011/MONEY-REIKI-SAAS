import { describe, expect, it, vi } from "vitest";
import { chunk, groupBy, unique } from "@/core/helpers/array";
import { deepClone } from "@/core/helpers/deepClone";
import { debounce } from "@/core/helpers/debounce";
import { formatCurrency } from "@/core/helpers/format";
import { createSlug } from "@/core/helpers/slug";
import { capitalize, truncate } from "@/core/helpers/string";
import { formatDuration, secondsToMs } from "@/core/helpers/time";
import { createUuid, isUuid } from "@/core/helpers/uuid";
import { clamp, formatPercent } from "@/core/helpers/number";
import { pick } from "@/core/helpers/object";

describe("core helpers", () => {
  it("formats strings and numbers", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(truncate("abcdefghij", 7)).toBe("abcd...");
    expect(clamp(12, 0, 10)).toBe(10);
    expect(formatPercent(75.555, 1)).toBe("75.6%");
    expect(formatCurrency(1500)).toContain("1,500");
  });

  it("manipulates arrays and objects", () => {
    expect(unique([1, 1, 2])).toEqual([1, 2]);
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4]
    ]);
    expect(groupBy(["a", "bb", "ccc"], (value) => value.length)).toEqual({
      1: ["a"],
      2: ["bb"],
      3: ["ccc"]
    });
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
  });

  it("creates slugs and uuids", () => {
    expect(createSlug("Money Reiki 101")).toBe("money-reiki-101");
    const id = createUuid();
    expect(isUuid(id)).toBe(true);
  });

  it("clones nested values", () => {
    const source = { user: { name: "Ayush" }, tags: ["a"] };
    const clone = deepClone(source);

    clone.user.name = "Changed";
    clone.tags.push("b");

    expect(source.user.name).toBe("Ayush");
    expect(source.tags).toEqual(["a"]);
  });

  it("debounces function calls", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("formats time helpers", () => {
    expect(secondsToMs(2)).toBe(2000);
    expect(formatDuration(125)).toBe("2m 5s");
  });
});
