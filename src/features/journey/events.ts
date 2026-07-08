import type { JourneyEvent, JourneyEventName } from "@/types/journey";
import type { UUID } from "@/types/core";

export type JourneyEventHandler = (event: JourneyEvent) => void | Promise<void>;

/**
 * Lightweight in-process journey event bus.
 */
export class JourneyEventBus {
  private readonly handlers = new Map<JourneyEventName, Set<JourneyEventHandler>>();

  /** Subscribe to a journey event. */
  on(eventName: JourneyEventName, handler: JourneyEventHandler): () => void {
    const set = this.handlers.get(eventName) ?? new Set<JourneyEventHandler>();
    set.add(handler);
    this.handlers.set(eventName, set);
    return () => set.delete(handler);
  }

  /** Emit a journey event to subscribers. */
  async emit(
    name: JourneyEventName,
    userId: UUID,
    payload: Record<string, unknown>,
    journeyId?: UUID
  ): Promise<JourneyEvent> {
    const event: JourneyEvent = {
      name,
      userId,
      journeyId,
      payload,
      createdAt: new Date().toISOString()
    };

    const handlers = this.handlers.get(name);
    if (handlers) {
      await Promise.all([...handlers].map((handler) => handler(event)));
    }

    return event;
  }
}

/** Shared journey event bus instance. */
export const journeyEventBus = new JourneyEventBus();
