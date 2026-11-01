import { VendorCategory } from './vendor';

export type BudgetTier = 'budget' | 'mid_range' | 'premium' | 'luxury';

export interface CatalogVendor {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  rating: number;
  quotation: number;
  negotiatedPrice: number;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  description: string;
  specialties: string[];
  budgetTier: BudgetTier;
  minGuestCapacity?: number;
  maxGuestCapacity?: number;
  portfolioHighlights?: string[];
}

