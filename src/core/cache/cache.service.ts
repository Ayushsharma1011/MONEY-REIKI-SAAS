type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

export type CacheServiceOptions = {
  namespace?: string;
  defaultTtlMs?: number;
};

export class MemoryCacheService {
  private readonly namespace: string;
  private readonly defaultTtlMs?: number;
  private readonly store = new Map<string, CacheEntry<unknown>>();

  constructor(options: CacheServiceOptions = {}) {
    this.namespace = options.namespace ?? "default";
    this.defaultTtlMs = options.defaultTtlMs;
  }

  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= Date.now();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(this.buildKey(key));

    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.store.delete(this.buildKey(key));
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    const expiresAt =
      typeof ttlMs === "number" && ttlMs > 0 ? Date.now() + ttlMs : null;

    this.store.set(this.buildKey(key), { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.store.delete(this.buildKey(key));
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
      }
    }

    return this.store.size;
  }
}

/** Default in-memory cache for shared infrastructure. */
export const cacheService = new MemoryCacheService({
  namespace: "platform",
  defaultTtlMs: 60_000
});
