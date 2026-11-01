import { ref, get } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { CatalogVendor } from '../../types/vendorCatalog';
import { VENDOR_CATALOG } from '../../../server/vendorCatalog';
import { filterCatalogVendors, CatalogFilterParams } from '../../utils/vendorFilter';

export type { CatalogFilterParams };

export const VendorCatalogService = {
  /**
   * Applies client-side filters and sorting to any vendor catalog array
   */
  filterVendors(vendors: CatalogVendor[], filters: CatalogFilterParams = {}): CatalogVendor[] {
    return filterCatalogVendors(vendors, filters);
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
