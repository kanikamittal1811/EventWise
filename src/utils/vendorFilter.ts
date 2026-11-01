import { CatalogVendor, BudgetTier } from '../types/vendorCatalog';

export interface CatalogFilterParams {
  category?: string;
  budgetTier?: BudgetTier | 'all';
  city?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
}

/**
 * Pure, deterministic vendor catalog filtering and sorting function.
 * Shared across client services and server catalog API endpoint.
 */
export function filterCatalogVendors(
  vendors: CatalogVendor[],
  filters: CatalogFilterParams = {}
): CatalogVendor[] {
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
  if (filters.minBudget !== undefined && !isNaN(filters.minBudget)) {
    filtered = filtered.filter((v) => v.quotation >= filters.minBudget!);
  }
  if (filters.maxBudget !== undefined && !isNaN(filters.maxBudget)) {
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

  // Sort descending by rating
  filtered.sort((a, b) => b.rating - a.rating);
  return filtered;
}
