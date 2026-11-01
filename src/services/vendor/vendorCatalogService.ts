import { ref, get } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { CatalogVendor, BudgetTier } from '../../types/vendorCatalog';
import { VENDOR_CATALOG } from '../../../server/vendorCatalog';

export interface CatalogFilterParams {
  category?: string;
  budgetTier?: BudgetTier | 'all';
  city?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
}

export const VendorCatalogService = {
  /**
   * Applies client-side filters and sorting to any vendor catalog array
   */
  filterVendors(vendors: CatalogVendor[], filters: CatalogFilterParams = {}): CatalogVendor[] {
    let filtered = [...vendors];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((v) => v.category === filters.category);
    }
    if (filters.budgetTier && filters.budgetTier !== 'all') {
      filtered = filtered.filter((v) => v.budgetTier === filters.budgetTier);
    }
    if (filters.city && filters.city !== 'all') {
      filtered = filtered.filter((v) => v.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters.minBudget !== undefined) {
      filtered = filtered.filter((v) => v.quotation >= filters.minBudget!);
    }
    if (filters.maxBudget !== undefined) {
      filtered = filtered.filter((v) => v.quotation <= filters.maxBudget!);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  },

  /**
   * Fetches curated vendor catalog from Firebase Realtime Database with server API and offline fallback
   */
  async getCatalogVendors(filters: CatalogFilterParams = {}): Promise<CatalogVendor[]> {
    // 1. First priority: Read directly from Firebase Realtime Database
    if (isFirebaseConfigured && database) {
      try {
        const snap = await get(ref(database, 'vendorCatalog'));
        if (snap.exists()) {
          const val = snap.val();
          const list: CatalogVendor[] = Array.isArray(val) ? val : Object.values(val);
          if (list && list.length > 0) {
            return this.filterVendors(list, filters);
          }
        }
      } catch (err) {
        console.warn('[VendorCatalogService] Could not fetch catalog from Firebase, attempting server/local fallback:', err);
      }
    }

    // 2. Second priority: Server API endpoint
    try {
      const query = new URLSearchParams();
      if (filters.category && filters.category !== 'all') query.append('category', filters.category);
      if (filters.budgetTier && filters.budgetTier !== 'all') query.append('budgetTier', filters.budgetTier);
      if (filters.city && filters.city !== 'all') query.append('city', filters.city);
      if (filters.search) query.append('search', filters.search);
      if (filters.minBudget !== undefined) query.append('minBudget', String(filters.minBudget));
      if (filters.maxBudget !== undefined) query.append('maxBudget', String(filters.maxBudget));

      const res = await fetch(`/api/vendors/catalog?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Server unreachable or running in test/static environment
    }

    // 3. Third priority: High-fidelity client-side fallback using embedded VENDOR_CATALOG
    return this.filterVendors(VENDOR_CATALOG, filters);
  },
};
