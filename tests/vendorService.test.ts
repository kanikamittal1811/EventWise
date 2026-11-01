import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { EventService } from '../src/services/event/eventService';
import { VendorService } from '../src/services/vendor/vendorService';

describe('VendorService Unit Tests (Offline / Local Mode)', () => {
  let eventId: string;

  beforeEach(async () => {
    const storage = setupLocalStorageMock();
    storage.clear();

    eventId = await EventService.createEvent(
      'user_123',
      {
        name: 'Grand Birthday Bash',
        category: 'birthday',
        location: 'Mumbai',
        eventDate: '2027-09-01',
        guestCount: 100,
        totalBudget: 800000,
        currency: 'INR',
      },
      false
    );
  });

  it('adds a vendor with quotation, negotiated price, and booking status', async () => {
    const vendorId = await VendorService.addVendor(eventId, {
      name: 'Starlight Sound & DJ',
      category: 'entertainment',
      contactName: 'DJ Rohan',
      phone: '+919988776655',
      email: 'rohan@starlight.in',
      website: 'https://starlight.in',
      quotation: 120000,
      negotiatedPrice: 95000,
      bookingStatus: 'negotiating',
      paymentStatus: 'unpaid',
      rating: 5,
      notes: 'Includes wireless microphones and ambient lasers',
    });

    expect(vendorId).toMatch(/^vnd_/);
    const event = await EventService.getEvent(eventId);
    const vendor = event?.vendors?.[vendorId];

    expect(vendor).toBeDefined();
    expect(vendor?.name).toBe('Starlight Sound & DJ');
    expect(vendor?.quotation).toBe(120000);
    expect(vendor?.negotiatedPrice).toBe(95000);
    expect(vendor?.bookingStatus).toBe('negotiating');
    expect(vendor?.paymentStatus).toBe('unpaid');
    expect(vendor?.rating).toBe(5);
  });

  it('updates vendor prices with currency rounding and transitions booking status', async () => {
    const vendorId = await VendorService.addVendor(eventId, {
      name: 'Artisan Cake Studio',
      category: 'catering',
      quotation: 35000,
      negotiatedPrice: 35000,
      bookingStatus: 'contacted',
      paymentStatus: 'unpaid',
    });

    await VendorService.updateVendor(eventId, vendorId, {
      negotiatedPrice: 30000.75,
      bookingStatus: 'booked',
      paymentStatus: 'deposit_paid',
    });

    const event = await EventService.getEvent(eventId);
    const updated = event?.vendors?.[vendorId];

    expect(updated?.negotiatedPrice).toBe(30000.75); // 2-decimal rounding
    expect(updated?.bookingStatus).toBe('booked');
    expect(updated?.paymentStatus).toBe('deposit_paid');
  });

  it('attaches image reference IDs to a vendor without duplicates', async () => {
    const vendorId = await VendorService.addVendor(eventId, {
      name: 'Bloom Floral Stylists',
      category: 'decor',
      quotation: 150000,
      negotiatedPrice: 130000,
      bookingStatus: 'booked',
      paymentStatus: 'fully_paid',
    });

    await VendorService.attachImage(eventId, vendorId, 'img_stage_concept_1');
    await VendorService.attachImage(eventId, vendorId, 'img_entrance_arch_2');
    // Attempt duplicate attach
    await VendorService.attachImage(eventId, vendorId, 'img_stage_concept_1');

    const event = await EventService.getEvent(eventId);
    const images = event?.vendors?.[vendorId]?.imageReferences || [];
    expect(images.length).toBe(2);
    expect(images).toContain('img_stage_concept_1');
    expect(images).toContain('img_entrance_arch_2');
  });

  it('deletes a vendor', async () => {
    const vendorId = await VendorService.addVendor(eventId, {
      name: 'Backup Photographer',
      category: 'photography',
      quotation: 50000,
      negotiatedPrice: 50000,
      bookingStatus: 'declined',
      paymentStatus: 'unpaid',
    });

    let event = await EventService.getEvent(eventId);
    expect(event?.vendors?.[vendorId]).toBeDefined();

    await VendorService.deleteVendor(eventId, vendorId);
    event = await EventService.getEvent(eventId);
    expect(event?.vendors?.[vendorId]).toBeUndefined();
  });
});
