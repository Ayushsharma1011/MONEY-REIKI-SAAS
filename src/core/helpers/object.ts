export function pick<T extends object, K extends keyof T>(
  source: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in source) {
      result[key] = source[key];
    }
  }

  return result;
}

export function omit<T extends object, K extends keyof T>(
  source: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...source };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source };
}

export function getPath<T>(
  source: Record<string, unknown>,
  path: string,
  fallback?: T
): T | undefined {
  const segments = path.split(".");
  let current: unknown = source;

  for (const segment of segments) {
    if (!isPlainObject(current) || !(segment in current)) {
      return fallback;
    }

    current = current[segment];
  }

  return current as T;
}
