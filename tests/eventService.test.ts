import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { EventService } from '../src/services/event/eventService';
import { EventFormData } from '../src/schemas/event.schema';

describe('EventService Unit Tests (Offline / Local Mode)', () => {
  beforeEach(() => {
    const storage = setupLocalStorageMock();
    storage.clear();
  });

  const mockFormData: EventFormData = {
    name: 'Roy & Priya Wedding Gala',
    category: 'wedding',
    description: 'Traditional Punjabi Wedding Celebration',
    location: 'Amritsar, Punjab',
    eventDate: '2027-02-20',
    guestCount: 250,
    totalBudget: 2000000,
    currency: 'INR',
    theme: 'Royal Heritage & Floral Elegance',
  };

  it('creates an event with default pre-populated budget categories', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData, true);
    expect(eventId).toMatch(/^evt_/);

    const event = await EventService.getEvent(eventId);
    expect(event).not.toBeNull();
    expect(event?.name).toBe('Roy & Priya Wedding Gala');
    expect(event?.ownerId).toBe('user_123');
    expect(event?.guestCount).toBe(250);
    expect(event?.totalBudget).toBe(2000000);
    expect(event?.currency).toBe('INR');

    // Default categories should have been populated
    const categories = Object.values(event?.budget?.categories || {});
    expect(categories.length).toBeGreaterThan(0);

    const venueCat = categories.find((c) => c.name.toLowerCase().includes('venue'));
    expect(venueCat).toBeDefined();
    expect(venueCat?.allocatedAmount).toBeGreaterThan(0);
  });

  it('creates an event without pre-populated categories when initialCategories is false', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData, false);
    const event = await EventService.getEvent(eventId);

    expect(event).not.toBeNull();
    expect(Object.keys(event?.budget?.categories || {}).length).toBe(0);
  });

  it('retrieves all events belonging to a specific owner', async () => {
    await EventService.createEvent('user_alice', { ...mockFormData, name: 'Alice Event 1' });
    await EventService.createEvent('user_alice', { ...mockFormData, name: 'Alice Event 2' });
    await EventService.createEvent('user_bob', { ...mockFormData, name: 'Bob Event' });

    const aliceEvents = await EventService.getUserEvents('user_alice');
    expect(aliceEvents.length).toBe(2);
    expect(aliceEvents.map((e) => e.name)).toContain('Alice Event 1');
    expect(aliceEvents.map((e) => e.name)).toContain('Alice Event 2');

    const bobEvents = await EventService.getUserEvents('user_bob');
    expect(bobEvents.length).toBe(1);
    expect(bobEvents[0].name).toBe('Bob Event');
  });

  it('updates an existing event fields safely', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData);
    await EventService.updateEvent(eventId, {
      guestCount: 300,
      location: 'Chandigarh Resort & Spa',
      status: 'in_progress',
    });

    const updated = await EventService.getEvent(eventId);
    expect(updated?.guestCount).toBe(300);
    expect(updated?.location).toBe('Chandigarh Resort & Spa');
    expect(updated?.status).toBe('in_progress');
  });

  it('deletes an event successfully', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData);
    expect(await EventService.getEvent(eventId)).not.toBeNull();

    await EventService.deleteEvent(eventId, 'user_123');
    expect(await EventService.getEvent(eventId)).toBeNull();
  });

  it('adds and deletes multi-day event functions (itinerary items)', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData);

    const fnId = await EventService.addEventFunction(eventId, {
      name: 'Sangeet Night',
      date: '2027-02-19',
      startTime: '19:00',
      endTime: '23:30',
      venue: 'Grand Ball Room',
      description: 'Music, dancing and dinner',
    });

    expect(fnId).toMatch(/^fn_/);
    let event = await EventService.getEvent(eventId);
    expect(event?.functions?.[fnId]?.name).toBe('Sangeet Night');

    await EventService.deleteEventFunction(eventId, fnId);
    event = await EventService.getEvent(eventId);
    expect(event?.functions?.[fnId]).toBeUndefined();
  });

  it('logs user activity items properly', async () => {
    const eventId = await EventService.createEvent('user_123', mockFormData);

    await EventService.logActivity(eventId, {
      userId: 'user_123',
      userName: 'Planner',
      action: 'booked caterer',
      entityType: 'vendor',
      entityName: 'Royal Spice Caterers',
    });

    const event = await EventService.getEvent(eventId);
    const activities = Object.values(event?.activity || {});
    const log = activities.find((a) => a.action === 'booked caterer');
    expect(log).toBeDefined();
    expect(log?.entityName).toBe('Royal Spice Caterers');
  });
});

