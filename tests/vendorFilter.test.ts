import { describe, it, expect } from 'vitest';
import { filterCatalogVendors } from '../src/utils/vendorFilter';
import { CatalogVendor } from '../src/types/vendorCatalog';

const mockVendors: CatalogVendor[] = [
  {
    id: 'v1',
    name: 'Jaigarh Royal Resort',
    category: 'venue',
    city: 'Jaipur',
    rating: 4.8,
    quotation: 500000,
    negotiatedPrice: 450000,
    contactName: 'Ranvijay',
    phone: '919876543210',
    email: 'info@jaigarh.in',
    website: 'https://jaigarh.in',
    address: 'Amer Road',
    description: 'Palace wedding venue',
    specialties: ['Royal Heritage', 'Lawns'],
    budgetTier: 'luxury',
  },
  {
    id: 'v2',
    name: 'Udaipur Lake View Banquets',
    category: 'venue',
    city: 'Udaipur',
    rating: 4.5,
    quotation: 300000,
    negotiatedPrice: 280000,
    contactName: 'Vikram',
    phone: '919876543211',
    email: 'info@lakeview.in',
    website: 'https://lakeview.in',
    address: 'Fateh Sagar',
    description: 'Lakefront banquet',
    specialties: ['Lake View'],
    budgetTier: 'premium',
  },
  {
    id: 'v3',
    name: 'Budget Chaat Catering',
    category: 'catering',
    city: 'Jaipur',
    rating: 4.2,
    quotation: 50000,
    negotiatedPrice: 45000,
    contactName: 'Ramesh',
    phone: '919876543212',
    email: 'ramesh@chaat.in',
    website: 'https://chaat.in',
    address: 'MI Road',
    description: 'Authentic street food stalls',
    specialties: ['Live Counters'],
    budgetTier: 'budget',
  },
];

describe('filterCatalogVendors Utility', () => {
  it('returns all vendors sorted by rating when no filters are passed', () => {
    const result = filterCatalogVendors(mockVendors);
    expect(result.length).toBe(3);
    expect(result[0].rating).toBe(4.8);
    expect(result[1].rating).toBe(4.5);
    expect(result[2].rating).toBe(4.2);
  });

  it('filters by category', () => {
    const venues = filterCatalogVendors(mockVendors, { category: 'venue' });
    expect(venues.length).toBe(2);
    expect(venues.every((v) => v.category === 'venue')).toBe(true);

    const catering = filterCatalogVendors(mockVendors, { category: 'catering' });
    expect(catering.length).toBe(1);
    expect(catering[0].name).toBe('Budget Chaat Catering');
  });

  it('filters by city case-insensitively', () => {
    const jaipur = filterCatalogVendors(mockVendors, { city: 'jaipur' });
    expect(jaipur.length).toBe(2);

    const udaipur = filterCatalogVendors(mockVendors, { city: 'UDAIPUR' });
    expect(udaipur.length).toBe(1);
    expect(udaipur[0].city).toBe('Udaipur');
  });

  it('filters by budget bounds', () => {
    const affordable = filterCatalogVendors(mockVendors, { maxBudget: 100000 });
    expect(affordable.length).toBe(1);
    expect(affordable[0].id).toBe('v3');

    const highEnd = filterCatalogVendors(mockVendors, { minBudget: 400000 });
    expect(highEnd.length).toBe(1);
    expect(highEnd[0].id).toBe('v1');
  });

  it('filters by search term matching name or specialties', () => {
    const searched = filterCatalogVendors(mockVendors, { search: 'heritage' });
    expect(searched.length).toBe(1);
    expect(searched[0].id).toBe('v1');

    const liveCounter = filterCatalogVendors(mockVendors, { search: 'Live Counters' });
    expect(liveCounter.length).toBe(1);
    expect(liveCounter[0].id).toBe('v3');
  });

  it('filters by budgetTier', () => {
    const luxury = filterCatalogVendors(mockVendors, { budgetTier: 'luxury' });
    expect(luxury.length).toBe(1);
    expect(luxury[0].budgetTier).toBe('luxury');
  });
});
