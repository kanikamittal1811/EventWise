import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  push,
} from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { EventItem, EventFunction, ActivityItem } from '../../types/event';
import { EventFormData } from '../../schemas/event.schema';
import { DEFAULT_BUDGET_CATEGORIES } from '../../constants/categories';
import {
  LOCAL_EVENTS_KEY,
  LOCAL_EVENTS_CHANGED_EVENT,
  getLocalDemoEvents,
  notifyLocalEventsChanged,
  seedLocalDemoData,
} from '../../constants/dummyData';

function getLocalEvents(): Record<string, EventItem> {
  return getLocalDemoEvents();
}

function saveLocalEvents(events: Record<string, EventItem>) {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[EventService] Could not write to localStorage:', err);
  }
  notifyLocalEventsChanged();
}

export const EventService = {
  async createEvent(
    ownerId: string,
    data: EventFormData,
    initialCategories = true
  ): Promise<string> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const newEvent: EventItem = {
      id: eventId,
      ownerId,
      name: data.name,
      category: data.category,
      description: data.description || '',
      location: data.location,
      eventDate: data.eventDate,
      endDate: data.endDate || '',
      guestCount: data.guestCount,
      totalBudget: data.totalBudget,
      currency: data.currency || 'INR',
      theme: data.theme || '',
      status: 'planning',
      createdAt: now,
      updatedAt: now,
      budget: {
        total: data.totalBudget,
        categories: {},
        expenses: {},
      },
      functions: {},
      vendors: {},
      tasks: {},
      guests: {},
      moodboards: {},
      collaborators: {
        [ownerId]: {
          uid: ownerId,
          email: '',
          displayName: 'Owner',
          role: 'owner',
          addedAt: now,
        },
      },
      activity: {
        act_init: {
          id: 'act_init',
          userId: ownerId,
          userName: 'You',
          action: 'created event',
          entityType: 'event',
          entityName: data.name,
          timestamp: now,
        },
      },
    };

    // Pre-populate sensible budget categories if initialCategories is true and totalBudget > 0
    if (initialCategories && data.totalBudget > 0 && newEvent.budget) {
      DEFAULT_BUDGET_CATEGORIES.forEach((cat, index) => {
        const catId = `cat_${index}_${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const allocatedAmount = Math.round((data.totalBudget * cat.percentage) / 100);
        newEvent.budget!.categories![catId] = {
          id: catId,
          name: cat.name,
          allocatedAmount,
          color: cat.color,
        };
      });
    }

    if (!isFirebaseConfigured || !database || ownerId.startsWith('demo_')) {
      const events = getLocalEvents();
      events[eventId] = newEvent;
      saveLocalEvents(events);
      return eventId;
    }

    try {
      // Persist in Realtime Database under events/{eventId}
      await set(ref(database, `events/${eventId}`), newEvent);
      // Maintain index for user events under userEvents/{ownerId}/{eventId}
      await set(ref(database, `userEvents/${ownerId}/${eventId}`), {
        id: eventId,
        name: newEvent.name,
        category: newEvent.category,
        eventDate: newEvent.eventDate,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('[EventService] Firebase write failed, saving to local storage fallback:', err);
    }

    // Always mirror to local storage
    const events = getLocalEvents();
    events[eventId] = newEvent;
    saveLocalEvents(events);

    return eventId;
  },

  async getEvent(eventId: string): Promise<EventItem | null> {
    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      const events = getLocalEvents();
      return events[eventId] || null;
    }

    try {
      const snap = await get(ref(database, `events/${eventId}`));
      if (snap.exists()) {
        return snap.val() as EventItem;
      }
    } catch (err) {
      console.warn(`[EventService] Error fetching event ${eventId} from Firebase:`, err);
    }
    const events = getLocalEvents();
    return events[eventId] || null;
  },

  subscribeToEvent(eventId: string, callback: (event: EventItem | null) => void): () => void {
    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      const events = getLocalEvents();
      callback(events[eventId] || null);

      const handler = () => {
        const updated = getLocalEvents();
        callback(updated[eventId] || null);
      };
      window.addEventListener('storage', handler);
      window.addEventListener(LOCAL_EVENTS_CHANGED_EVENT, handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(LOCAL_EVENTS_CHANGED_EVENT, handler);
      };
    }

    const eventRef = ref(database, `events/${eventId}`);
    return onValue(
      eventRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as EventItem);
        } else {
          const localEvents = getLocalEvents();
          callback(localEvents[eventId] || null);
        }
      },
      (err) => {
        console.warn(`[EventService] Firebase subscription error for event ${eventId}, falling back to local:`, err);
        const localEvents = getLocalEvents();
        callback(localEvents[eventId] || null);
      }
    );
  },

  async getUserEvents(ownerId: string): Promise<EventItem[]> {
    if (!isFirebaseConfigured || !database || ownerId.startsWith('demo_')) {
      let events = getLocalEvents();
      let userEvents = Object.values(events).filter((e) => e.ownerId === ownerId);
      if (userEvents.length === 0 && ownerId.startsWith('demo_')) {
        events = seedLocalDemoData(ownerId);
        userEvents = Object.values(events).filter((e) => e.ownerId === ownerId);
      }
      return userEvents;
    }

    const db = database;
    try {
      const snap = await get(ref(db, `userEvents/${ownerId}`));
      if (!snap.exists()) {
        const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
        return localList;
      }

      const userEventsMap = snap.val() || {};
      const eventIds = Object.keys(userEventsMap);
      if (eventIds.length === 0) {
        const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
        return localList;
      }

      const eventPromises = eventIds.map(async (id) => {
        try {
          const eventSnap = await get(ref(db, `events/${id}`));
          return eventSnap.exists() ? (eventSnap.val() as EventItem) : null;
        } catch (err) {
          console.error(`[EventService] Error fetching event ${id}:`, err);
          return null;
        }
      });

      const fullEvents = await Promise.all(eventPromises);
      const filtered = fullEvents.filter((e): e is EventItem => Boolean(e));
      if (filtered.length === 0) {
        return Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
      }
      return filtered;
    } catch (error) {
      console.error('[EventService] Error fetching user events:', error);
      return Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
    }
  },

  subscribeToUserEvents(ownerId: string, callback: (events: EventItem[]) => void): () => void {
    if (!isFirebaseConfigured || !database || ownerId.startsWith('demo_')) {
      let events = getLocalEvents();
      let userList = Object.values(events).filter((e) => e.ownerId === ownerId);
      if (userList.length === 0 && ownerId.startsWith('demo_')) {
        events = seedLocalDemoData(ownerId);
        userList = Object.values(events).filter((e) => e.ownerId === ownerId);
      }
      callback(userList);

      const handler = () => {
        const updated = getLocalEvents();
        callback(Object.values(updated).filter((e) => e.ownerId === ownerId));
      };
      window.addEventListener('storage', handler);
      window.addEventListener(LOCAL_EVENTS_CHANGED_EVENT, handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(LOCAL_EVENTS_CHANGED_EVENT, handler);
      };
    }

    const db = database;
    const userEventsRef = ref(db, `userEvents/${ownerId}`);
    let individualUnsubscribes: Record<string, () => void> = {};
    const eventMap: Record<string, EventItem> = {};

    const cleanIndividualSubscriptions = () => {
      Object.values(individualUnsubscribes).forEach((unsub) => unsub());
      individualUnsubscribes = {};
    };

    const notify = () => {
      const list = Object.values(eventMap).filter(Boolean);
      if (list.length > 0) {
        callback(list);
      } else {
        const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
        callback(localList);
      }
    };

    const unsubscribeUserEvents = onValue(
      userEventsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          cleanIndividualSubscriptions();
          Object.keys(eventMap).forEach((k) => delete eventMap[k]);
          const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
          callback(localList);
          return;
        }

        const userEventsMap = snapshot.val() || {};
        const eventIds = Object.keys(userEventsMap);

        if (eventIds.length === 0) {
          cleanIndividualSubscriptions();
          Object.keys(eventMap).forEach((k) => delete eventMap[k]);
          const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
          callback(localList);
          return;
        }

        // Clean up subscriptions for removed events
        Object.keys(individualUnsubscribes).forEach((id) => {
          if (!userEventsMap[id]) {
            individualUnsubscribes[id]();
            delete individualUnsubscribes[id];
            delete eventMap[id];
          }
        });

        // Setup real-time listener for each event
        eventIds.forEach((id) => {
          if (!individualUnsubscribes[id]) {
            individualUnsubscribes[id] = onValue(
              ref(db, `events/${id}`),
              (eventSnap) => {
                if (eventSnap.exists()) {
                  eventMap[id] = eventSnap.val() as EventItem;
                } else {
                  delete eventMap[id];
                }
                notify();
              },
              (err) => {
                console.warn(`[EventService] Error listening to event ${id}:`, err);
              }
            );
          }
        });
      },
      (error) => {
        console.warn('[EventService] Failed to listen to user events, checking local storage:', error);
        const localList = Object.values(getLocalEvents()).filter((e) => e.ownerId === ownerId);
        callback(localList);
      }
    );

    return () => {
      unsubscribeUserEvents();
      cleanIndividualSubscriptions();
    };
  },

  async updateEvent(eventId: string, updates: Partial<EventItem>): Promise<void> {
    const safeUpdates = {
      ...updates,
      updatedAt: Date.now(),
    };

    const events = getLocalEvents();
    if (events[eventId]) {
      events[eventId] = { ...events[eventId], ...safeUpdates };
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}`), safeUpdates);
    } catch (err) {
      console.warn(`[EventService] Firebase updateEvent failed for ${eventId}:`, err);
    }
  },

  async deleteEvent(eventId: string, ownerId: string): Promise<void> {
    const events = getLocalEvents();
    if (events[eventId]) {
      delete events[eventId];
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await remove(ref(database, `events/${eventId}`));
      await remove(ref(database, `userEvents/${ownerId}/${eventId}`));
    } catch (err) {
      console.warn(`[EventService] Firebase deleteEvent failed for ${eventId}:`, err);
    }
  },

  async addEventFunction(eventId: string, fn: Omit<EventFunction, 'id'>): Promise<string> {
    const fnId = `fn_${Date.now()}`;
    const newFn: EventFunction = { ...fn, id: fnId };

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].functions) events[eventId].functions = {};
      events[eventId].functions![fnId] = newFn;
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return fnId;
    }

    try {
      await set(ref(database, `events/${eventId}/functions/${fnId}`), newFn);
    } catch (err) {
      console.warn(`[EventService] Firebase addEventFunction failed for ${eventId}:`, err);
    }
    return fnId;
  },

  async deleteEventFunction(eventId: string, functionId: string): Promise<void> {
    const events = getLocalEvents();
    if (events[eventId]?.functions) {
      delete events[eventId].functions![functionId];
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await remove(ref(database, `events/${eventId}/functions/${functionId}`));
    } catch (err) {
      console.warn(`[EventService] Firebase deleteEventFunction failed:`, err);
    }
  },

  async logActivity(
    eventId: string,
    activity: Omit<ActivityItem, 'id' | 'timestamp'>
  ): Promise<void> {
    const actId = `act_${Date.now()}`;
    const item: ActivityItem = {
      ...activity,
      id: actId,
      timestamp: Date.now(),
    };

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].activity) events[eventId].activity = {};
      events[eventId].activity![actId] = item;
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await set(ref(database, `events/${eventId}/activity/${actId}`), item);
    } catch (err) {
      console.warn(`[EventService] Firebase logActivity failed for ${eventId}:`, err);
    }
  },
};

