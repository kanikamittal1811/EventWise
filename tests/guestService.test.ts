import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { EventService } from '../src/services/event/eventService';
import { GuestService } from '../src/services/guest/guestService';

describe('GuestService Unit Tests (Offline / Local Mode)', () => {
  let eventId: string;

  beforeEach(async () => {
    const storage = setupLocalStorageMock();
    storage.clear();

    eventId = await EventService.createEvent(
      'user_123',
      {
        name: 'Anniversary Dinner Party',
        category: 'anniversary',
        location: 'Goa',
        eventDate: '2027-08-15',
        guestCount: 50,
        totalBudget: 300000,
        currency: 'INR',
      },
      false
    );
  });

  it('adds a new guest with plus-ones, dietary notes and RSVP status', async () => {
    const guestId = await GuestService.addGuest(eventId, {
      name: 'Dr. Arjun Kapoor',
      email: 'arjun.kapoor@example.com',
      phone: '+919876543210',
      category: 'close_friends',
      rsvpStatus: 'pending',
      plusOnes: 1,
      dietaryPreferences: 'Vegetarian, No Nuts',
      tableNumber: 'Table 4',
      invitationSent: false,
    });

    expect(guestId).toMatch(/^gst_/);
    const event = await EventService.getEvent(eventId);
    const guest = event?.guests?.[guestId];

    expect(guest).toBeDefined();
    expect(guest?.name).toBe('Dr. Arjun Kapoor');
    expect(guest?.email).toBe('arjun.kapoor@example.com');
    expect(guest?.category).toBe('close_friends');
    expect(guest?.plusOnes).toBe(1);
    expect(guest?.dietaryPreferences).toBe('Vegetarian, No Nuts');
    expect(guest?.tableNumber).toBe('Table 4');
    expect(guest?.invitationSent).toBe(false);
  });

  it('updates RSVP status and guest details', async () => {
    const guestId = await GuestService.addGuest(eventId, {
      name: 'Simran Sharma',
      category: 'family',
      rsvpStatus: 'pending',
      plusOnes: 0,
    });

    await GuestService.updateGuest(eventId, guestId, {
      rsvpStatus: 'attending',
      plusOnes: 2,
      notes: 'Coming with twins',
    });

    const event = await EventService.getEvent(eventId);
    const updated = event?.guests?.[guestId];
    expect(updated?.rsvpStatus).toBe('attending');
    expect(updated?.plusOnes).toBe(2);
    expect(updated?.notes).toBe('Coming with twins');
  });

  it('toggles invitation sent state and manages invitationSentDate timestamp', async () => {
    const guestId = await GuestService.addGuest(eventId, {
      name: 'Kabir Mehra',
      category: 'colleagues',
      rsvpStatus: 'pending',
      plusOnes: 0,
      invitationSent: false,
    });

    // Mark sent
    await GuestService.toggleInvitationSent(eventId, guestId, true);
    let event = await EventService.getEvent(eventId);
    let guest = event?.guests?.[guestId];
    expect(guest?.invitationSent).toBe(true);
    expect(guest?.invitationSentDate).toBeDefined();

    // Mark not sent
    await GuestService.toggleInvitationSent(eventId, guestId, false);
    event = await EventService.getEvent(eventId);
    guest = event?.guests?.[guestId];
    expect(guest?.invitationSent).toBe(false);
    expect(guest?.invitationSentDate).toBeUndefined();
  });

  it('deletes a guest from the event', async () => {
    const guestId = await GuestService.addGuest(eventId, {
      name: 'Temporary Guest',
      category: 'other',
      rsvpStatus: 'declined',
      plusOnes: 0,
    });

    let event = await EventService.getEvent(eventId);
    expect(event?.guests?.[guestId]).toBeDefined();

    await GuestService.deleteGuest(eventId, guestId);
    event = await EventService.getEvent(eventId);
    expect(event?.guests?.[guestId]).toBeUndefined();
  });
});

