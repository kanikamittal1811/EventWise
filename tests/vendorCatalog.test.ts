import { describe, it, expect } from 'vitest';
import { VendorCatalogService } from '../src/services/vendor/vendorCatalogService';
import { VENDOR_CATALOG } from '../server/vendorCatalog';

describe('VendorCatalogService & Catalog Data', () => {
  it('contains over 30 pre-populated vendors covering all categories', () => {
    expect(VENDOR_CATALOG.length).toBeGreaterThanOrEqual(30);

    const categories = new Set(VENDOR_CATALOG.map((v) => v.category));
    expect(categories.has('venue')).toBe(true);
    expect(categories.has('catering')).toBe(true);
    expect(categories.has('photography')).toBe(true);
    expect(categories.has('videography')).toBe(true);
    expect(categories.has('decoration')).toBe(true);
    expect(categories.has('music_dj')).toBe(true);
    expect(categories.has('entertainment')).toBe(true);
    expect(categories.has('makeup_hair')).toBe(true);
    expect(categories.has('attire')).toBe(true);
    expect(categories.has('invitations')).toBe(true);
    expect(categories.has('transportation')).toBe(true);
    expect(categories.has('other')).toBe(true);
  });

  it('contains vendors across all 4 budget tiers with realistic pricing', () => {
    const tiers = new Set(VENDOR_CATALOG.map((v) => v.budgetTier));
    expect(tiers.has('budget')).toBe(true);
    expect(tiers.has('mid_range')).toBe(true);
    expect(tiers.has('premium')).toBe(true);
    expect(tiers.has('luxury')).toBe(true);

    // Verify budget vendors are < 1,00,000
    const budgetVendors = VENDOR_CATALOG.filter((v) => v.budgetTier === 'budget');
    budgetVendors.forEach((v) => {
      expect(v.quotation).toBeLessThanOrEqual(100000);
      expect(v.negotiatedPrice).toBeLessThanOrEqual(v.quotation);
    });

    // Verify luxury vendors are >= 10,00,000
    const luxuryVendors = VENDOR_CATALOG.filter((v) => v.budgetTier === 'luxury');
    luxuryVendors.forEach((v) => {
      expect(v.quotation).toBeGreaterThanOrEqual(1000000);
    });
  });

  it('filters catalog by category using VendorCatalogService', async () => {
    const venues = await VendorCatalogService.getCatalogVendors({ category: 'venue' });
    expect(venues.length).toBeGreaterThanOrEqual(4);
    expect(venues.every((v) => v.category === 'venue')).toBe(true);
  });

  it('filters catalog by budget tier using VendorCatalogService', async () => {
    const budgetItems = await VendorCatalogService.getCatalogVendors({ budgetTier: 'budget' });
    expect(budgetItems.length).toBeGreaterThanOrEqual(5);
    expect(budgetItems.every((v) => v.budgetTier === 'budget')).toBe(true);
  });

  it('ensures all vendor phone numbers are formatted in 91XXXXXX format', () => {
    VENDOR_CATALOG.forEach((v) => {
      expect(v.phone).toMatch(/^91\d{10}$/);
    });
  });

  it('filters catalog by search query for cities or names', async () => {
    const jaipurVendors = await VendorCatalogService.getCatalogVendors({ search: 'Jaipur' });
    expect(jaipurVendors.length).toBeGreaterThanOrEqual(5);
    expect(
      jaipurVendors.every(
        (v) =>
          v.city.toLowerCase().includes('jaipur') ||
          v.name.toLowerCase().includes('jaipur') ||
          v.description.toLowerCase().includes('jaipur')
      )
    ).toBe(true);
  });
});

