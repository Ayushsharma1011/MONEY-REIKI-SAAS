export function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

export function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
