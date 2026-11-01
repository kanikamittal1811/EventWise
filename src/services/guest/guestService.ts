import { ref, set, update, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { Guest } from '../../types/guest';
import { GuestFormData } from '../../schemas/guest.schema';

const LOCAL_EVENTS_KEY = 'eventwise_demo_events';

function getLocalEvents(): any {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalEvents(events: any) {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
}

export const GuestService = {
  async addGuest(eventId: string, data: GuestFormData): Promise<string> {
    const guestId = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const guest: Guest = {
      id: guestId,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      category: data.category,
      rsvpStatus: data.rsvpStatus,
      plusOnes: data.plusOnes || 0,
      dietaryPreferences: data.dietaryPreferences || '',
      tableNumber: data.tableNumber || '',
      invitationSent: data.invitationSent || false,
      invitationSentDate: data.invitationSent ? new Date().toISOString() : undefined,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]) {
        if (!events[eventId].guests) events[eventId].guests = {};
        events[eventId].guests[guestId] = guest;
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return guestId;
    }

    await set(ref(database, `events/${eventId}/guests/${guestId}`), guest);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
    return guestId;
  },

  async updateGuest(eventId: string, guestId: string, updates: Partial<Guest>): Promise<void> {
    const now = Date.now();
    const safeUpdates: Partial<Guest> = {
      ...updates,
      updatedAt: now,
    };

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.guests?.[guestId]) {
        events[eventId].guests[guestId] = {
          ...events[eventId].guests[guestId],
          ...safeUpdates,
        };
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return;
    }

    await update(ref(database, `events/${eventId}/guests/${guestId}`), safeUpdates);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
  },

  async toggleInvitationSent(eventId: string, guestId: string, sent: boolean): Promise<void> {
    await this.updateGuest(eventId, guestId, {
      invitationSent: sent,
      invitationSentDate: sent ? new Date().toISOString() : undefined,
    });
  },

  async deleteGuest(eventId: string, guestId: string): Promise<void> {
    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.guests?.[guestId]) {
        delete events[eventId].guests[guestId];
        events[eventId].updatedAt = Date.now();
        saveLocalEvents(events);
      }
      return;
    }

    await remove(ref(database, `events/${eventId}/guests/${guestId}`));
    await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
  },
};

