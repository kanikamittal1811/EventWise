import { EventItem } from '../../types/event';
import {
  LOCAL_EVENTS_KEY,
  getLocalDemoEvents,
  notifyLocalEventsChanged,
} from '../../constants/dummyData';

/**
 * Type-safe central accessor for offline-first local events storage.
 * Eliminates duplicate localStorage serialization code across services.
 */
export function getLocalEvents(): Record<string, EventItem> {
  return getLocalDemoEvents();
}

/**
 * Safely persists events dictionary to localStorage and dispatches notification events.
 */
export function saveLocalEvents(
  events: Record<string, EventItem>,
  caller = 'EventStorage'
): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    }
  } catch (err) {
    console.warn(`[${caller}] Failed to write to localStorage:`, err);
  }
  notifyLocalEventsChanged();
}

/**
 * Helper to mutate an event in-place in local storage and persist if found.
 */
export function mutateLocalEvent(
  eventId: string,
  mutateFn: (event: EventItem) => void,
  caller = 'EventStorage'
): boolean {
  const events = getLocalEvents();
  const target = events[eventId];
  if (!target) return false;

  mutateFn(target);
  target.updatedAt = Date.now();
  saveLocalEvents(events, caller);
  return true;
}
