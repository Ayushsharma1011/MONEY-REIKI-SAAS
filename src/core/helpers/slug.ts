import { toKebabCase } from "@/core/helpers/string";

export function createSlug(value: string): string {
  return toKebabCase(value)
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function appendSlugSuffix(baseSlug: string, suffix: string): string {
  const safeSuffix = createSlug(suffix);
  return safeSuffix ? `${baseSlug}-${safeSuffix}` : baseSlug;
}
