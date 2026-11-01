import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import {
  getLocalEvents,
  saveLocalEvents,
  mutateLocalEvent,
} from '../src/services/storage/localEventStorage';
import { EventItem } from '../src/types/event';

describe('localEventStorage Utility', () => {
  let storageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    storageMock = setupLocalStorageMock();
  });

  it('getLocalEvents returns empty record when localStorage is uninitialized', () => {
    const events = getLocalEvents();
    expect(typeof events).toBe('object');
    expect(Object.keys(events).length).toBe(0);
  });

  it('saveLocalEvents persists events dictionary to storage', () => {
    const mockEvents: Record<string, EventItem> = {
      test_evt: {
        id: 'test_evt',
        ownerId: 'user_1',
        name: 'Test Celebration',
        category: 'birthday',
        location: 'Mumbai',
        eventDate: '2027-01-01',
        guestCount: 50,
        totalBudget: 100000,
        currency: 'INR',
        status: 'planning',
        createdAt: 1000,
        updatedAt: 1000,
      },
    };

    saveLocalEvents(mockEvents, 'TestCaller');
    const readBack = getLocalEvents();
    expect(readBack.test_evt).toBeDefined();
    expect(readBack.test_evt.name).toBe('Test Celebration');
  });

  it('mutateLocalEvent updates an existing event and updates timestamp', () => {
    const mockEvents: Record<string, EventItem> = {
      test_evt: {
        id: 'test_evt',
        ownerId: 'user_1',
        name: 'Initial Name',
        category: 'birthday',
        location: 'Mumbai',
        eventDate: '2027-01-01',
        guestCount: 50,
        totalBudget: 100000,
        currency: 'INR',
        status: 'planning',
        createdAt: 1000,
        updatedAt: 1000,
      },
    };
    saveLocalEvents(mockEvents);

    const mutated = mutateLocalEvent('test_evt', (event) => {
      event.name = 'Updated Name';
    });

    expect(mutated).toBe(true);
    const updated = getLocalEvents();
    expect(updated.test_evt.name).toBe('Updated Name');
    expect(updated.test_evt.updatedAt).toBeGreaterThan(1000);
  });

  it('mutateLocalEvent returns false if event is not found', () => {
    const mutated = mutateLocalEvent('non_existent', () => {});
    expect(mutated).toBe(false);
  });
});
