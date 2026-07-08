import type {
  VideoPlaybackRequest,
  VideoPlaybackResult,
  VideoProvider,
  VideoProviderName
} from "@/types/learning";

/** Supported video providers for the learning platform. */
export const VIDEO_PROVIDER_NAMES: VideoProviderName[] = [
  "mux",
  "cloudflare_stream",
  "vimeo",
  "bunny",
  "supabase_storage",
  "s3"
];

/**
 * Registry for video provider adapters.
 * Concrete provider implementations are registered at runtime.
 */
export class VideoProviderRegistry {
  private readonly providers = new Map<VideoProviderName, VideoProvider>();

  /** Register a provider adapter. */
  register(provider: VideoProvider): void {
    this.providers.set(provider.name, provider);
  }

  /** Resolve a provider by name. */
  get(name: VideoProviderName): VideoProvider | null {
    return this.providers.get(name) ?? null;
  }

  /** Validate whether a provider is registered. */
  has(name: VideoProviderName): boolean {
    return this.providers.has(name);
  }

  /** Validate an asset id for the given provider. */
  validateAsset(provider: VideoProviderName, assetId: string): boolean {
    const adapter = this.get(provider);
    return adapter ? adapter.validateAsset(assetId) : false;
  }

  /** Resolve a playback URL through the registered provider. */
  async getPlaybackUrl(
    request: VideoPlaybackRequest
  ): Promise<VideoPlaybackResult> {
    const adapter = this.get(request.provider);

    if (!adapter) {
      throw new Error(`Video provider "${request.provider}" is not registered.`);
    }

    return adapter.getPlaybackUrl(request);
  }

  /** Resolve a signed playback URL through the registered provider. */
  async getSignedUrl(
    request: VideoPlaybackRequest,
    expiresInSeconds: number
  ): Promise<string> {
    const adapter = this.get(request.provider);

    if (!adapter) {
      throw new Error(`Video provider "${request.provider}" is not registered.`);
    }

    return adapter.getSignedUrl(request, expiresInSeconds);
  }

  /** Resolve an optional playback token through the registered provider. */
  async getPlaybackToken(
    request: VideoPlaybackRequest
  ): Promise<string | null> {
    const adapter = this.get(request.provider);
    if (!adapter?.getPlaybackToken) {
      return null;
    }

    return adapter.getPlaybackToken(request);
  }
}

/** Shared registry instance for learning video services. */
export const videoProviderRegistry = new VideoProviderRegistry();
