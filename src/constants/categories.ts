import { EventCategory } from '../types/event';
import { VendorCategory } from '../types/vendor';

export const EVENT_CATEGORIES: Array<{ id: EventCategory; label: string; icon: string; description: string }> = [
  { id: 'wedding', label: 'Wedding', icon: 'Heart', description: 'Ceremonies, receptions, sangeet, and destination weddings' },
  { id: 'birthday', label: 'Birthday Party', icon: 'Cake', description: 'Milestones, theme parties, and children celebrations' },
  { id: 'engagement', label: 'Engagement', icon: 'Sparkles', description: 'Ring ceremony, cocktails, and family banquets' },
  { id: 'anniversary', label: 'Anniversary', icon: 'Calendar', description: 'Silver, golden, and romantic milestones' },
  { id: 'baby_shower', label: 'Baby Shower', icon: 'Smile', description: 'Welcoming new arrivals with friends and family' },
  { id: 'corporate', label: 'Corporate Event', icon: 'Briefcase', description: 'Conferences, product launches, galas, and offsites' },
  { id: 'community', label: 'Community Gathering', icon: 'Users', description: 'Cultural meets, fundraisers, and neighborhood events' },
  { id: 'festival', label: 'Festival Celebration', icon: 'Sun', description: 'Diwali, Eid, Christmas, and holiday celebrations' },
  { id: 'custom', label: 'Custom Event', icon: 'PartyPopper', description: 'Any uniquely tailored gathering' },
];

export const VENDOR_CATEGORIES: Array<{ id: VendorCategory; label: string; defaultColor: string }> = [
  { id: 'venue', label: 'Venue & Banquets', defaultColor: '#6366F1' },
  { id: 'catering', label: 'Catering & Bar', defaultColor: '#F59E0B' },
  { id: 'photography', label: 'Photography', defaultColor: '#EC4899' },
  { id: 'videography', label: 'Cinematography', defaultColor: '#8B5CF6' },
  { id: 'decoration', label: 'Floral & Decor', defaultColor: '#10B981' },
  { id: 'entertainment', label: 'Live Entertainment', defaultColor: '#F43F5E' },
  { id: 'music_dj', label: 'DJ & Sound / AV', defaultColor: '#06B6D4' },
  { id: 'transportation', label: 'Travel & Transport', defaultColor: '#64748B' },
  { id: 'makeup_hair', label: 'Hair & Makeup', defaultColor: '#D946EF' },
  { id: 'attire', label: 'Attire & Jewelry', defaultColor: '#E11D48' },
  { id: 'invitations', label: 'Stationery & Invites', defaultColor: '#84CC16' },
  { id: 'other', label: 'Other Services', defaultColor: '#6B7280' },
];

export const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Venue & Banquets', percentage: 35, color: '#6366F1' },
  { name: 'Catering & Beverages', percentage: 25, color: '#F59E0B' },
  { name: 'Photography & Video', percentage: 12, color: '#EC4899' },
  { name: 'Decor & Flowers', percentage: 10, color: '#10B981' },
  { name: 'Entertainment & Music', percentage: 8, color: '#F43F5E' },
  { name: 'Attire & Makeup', percentage: 5, color: '#D946EF' },
  { name: 'Invitations & Gifts', percentage: 3, color: '#84CC16' },
  { name: 'Contingency & Misc', percentage: 2, color: '#6B7280' },
];

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED', label: 'AED (د.إ) - UAE Dirham' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) - Singapore Dollar' },
];

