import { ref, set, get, update, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { Vendor } from '../../types/vendor';
import { VendorFormData } from '../../schemas/vendor.schema';
import { roundCurrency } from '../../utils/calculations';

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

export const VendorService = {
  async addVendor(eventId: string, data: VendorFormData): Promise<string> {
    const vendorId = `vnd_${Date.now()}`;
    const now = Date.now();

    const vendor: Vendor = {
      id: vendorId,
      name: data.name,
      category: data.category,
      contactName: data.contactName || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      address: data.address || '',
      quotation: roundCurrency(data.quotation),
      negotiatedPrice: roundCurrency(data.negotiatedPrice),
      bookingStatus: data.bookingStatus,
      paymentStatus: data.paymentStatus,
      notes: data.notes || '',
      imageReferences: [],
      rating: data.rating,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]) {
        if (!events[eventId].vendors) events[eventId].vendors = {};
        events[eventId].vendors[vendorId] = vendor;
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return vendorId;
    }

    await set(ref(database, `events/${eventId}/vendors/${vendorId}`), vendor);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
    return vendorId;
  },

  async updateVendor(
    eventId: string,
    vendorId: string,
    updates: Partial<Vendor>
  ): Promise<void> {
    const now = Date.now();
    const safeUpdates: Partial<Vendor> = {
      ...updates,
      updatedAt: now,
    };

    if (safeUpdates.quotation !== undefined) safeUpdates.quotation = roundCurrency(safeUpdates.quotation);
    if (safeUpdates.negotiatedPrice !== undefined) safeUpdates.negotiatedPrice = roundCurrency(safeUpdates.negotiatedPrice);

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.vendors?.[vendorId]) {
        events[eventId].vendors[vendorId] = {
          ...events[eventId].vendors[vendorId],
          ...safeUpdates,
        };
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return;
    }

    await update(ref(database, `events/${eventId}/vendors/${vendorId}`), safeUpdates);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
  },

  async deleteVendor(eventId: string, vendorId: string): Promise<void> {
    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.vendors?.[vendorId]) {
        delete events[eventId].vendors[vendorId];
        events[eventId].updatedAt = Date.now();
        saveLocalEvents(events);
      }
      return;
    }

    await remove(ref(database, `events/${eventId}/vendors/${vendorId}`));
    await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
  },

  async attachImage(eventId: string, vendorId: string, imageId: string): Promise<void> {
    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      const v = events[eventId]?.vendors?.[vendorId];
      if (v) {
        if (!v.imageReferences) v.imageReferences = [];
        if (!v.imageReferences.includes(imageId)) {
          v.imageReferences.push(imageId);
          saveLocalEvents(events);
        }
      }
      return;
    }

    // Read current images
    if (!database) return;
    const snap = await get(ref(database, `events/${eventId}/vendors/${vendorId}/imageReferences`));
    const current: string[] = snap.exists() ? snap.val() : [];
    if (!current.includes(imageId)) {
      current.push(imageId);
      await set(ref(database, `events/${eventId}/vendors/${vendorId}/imageReferences`), current);
    }
  },
};
