import React, { useState, useEffect } from 'react';
import {
  Store,
  Star,
  MapPin,
  Users,
  Search,
  Plus,
  Check,
  Phone,
  Mail,
  Globe,
  SlidersHorizontal,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { CatalogVendor, BudgetTier } from '../../types/vendorCatalog';
import { VendorCatalogService } from '../../services/vendor/vendorCatalogService';
import { VENDOR_CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { isSafeHttpUrl, sanitizeTelUri, sanitizeMailtoUri } from '../../utils/security';
import { VendorCategory } from '../../types/vendor';

export interface VendorCatalogBrowserProps {
  onImportVendor: (vendor: CatalogVendor) => Promise<void>;
  onCustomizeVendor: (vendor: CatalogVendor) => void;
  existingVendorNames?: string[];
  currency?: string;
}

const BUDGET_TIER_OPTIONS: Array<{ id: BudgetTier | 'all'; label: string; range: string; color: string }> = [
  { id: 'all', label: 'All Budgets', range: 'Any Price', color: 'bg-charcoal-100 text-charcoal-700' },
  { id: 'budget', label: 'Budget', range: '< ₹1 Lakh', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'mid_range', label: 'Mid-Range', range: '₹1L - ₹5L', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'premium', label: 'Premium', range: '₹5L - ₹15L', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'luxury', label: 'Luxury', range: '₹15L+', color: 'bg-amber-50 text-amber-800 border-amber-200' },
];

export const VendorCatalogBrowser: React.FC<VendorCatalogBrowserProps> = ({
  onImportVendor,
  onCustomizeVendor,
  existingVendorNames = [],
  currency = 'INR',
}) => {
  const [vendors, setVendors] = useState<CatalogVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<BudgetTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Load catalog vendors
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    VendorCatalogService.getCatalogVendors({
      category: selectedCategory,
      budgetTier: selectedBudgetTier,
      search: searchQuery,
    })
      .then((data) => {
        if (isMounted) {
          setVendors(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedBudgetTier, searchQuery]);

  const handleImport = async (vendor: CatalogVendor) => {
    setImportingId(vendor.id);
    try {
      await onImportVendor(vendor);
      setImportedIds((prev) => new Set(prev).add(vendor.id));
    } finally {
      setImportingId(null);
    }
  };

  const getTierBadge = (tier: BudgetTier) => {
    switch (tier) {
      case 'budget':
        return <Badge variant="success">Budget (&lt; ₹1L)</Badge>;
      case 'mid_range':
        return <Badge variant="accent">Mid-Range (₹1L-5L)</Badge>;
      case 'premium':
        return <Badge variant="primary">Premium (₹5L-15L)</Badge>;
      case 'luxury':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">✨ Luxury (₹15L+)</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-4 shadow-subtle space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendors by name, specialty, or city (e.g., Jaipur, Photography, Sangeet)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background-subtle rounded-xl text-xs sm:text-sm text-charcoal border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
            />
          </div>

          <div className="text-xs text-charcoal-500 shrink-0 self-center">
            Found <span className="font-bold text-charcoal">{vendors.length}</span> verified vendors
          </div>
        </div>

        {/* Budget Tier Selector */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-charcoal-100">
          <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Budget Tier:
          </span>
          {BUDGET_TIER_OPTIONS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedBudgetTier(tier.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                selectedBudgetTier === tier.id
                  ? 'bg-primary text-white border-primary shadow-xs font-bold'
                  : 'bg-white text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50'
              }`}
            >
              {tier.label} <span className="text-[10px] opacity-80">({tier.range})</span>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-background-subtle text-charcoal-600 hover:bg-charcoal-100'
            }`}
          >
            All Categories
          </button>
          {VENDOR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-background-subtle text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <LoadingSpinner message="Loading curated vendor directory..." />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found for this filter"
          description="Try broadening your category or budget tier filter to explore more options."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('all');
            setSelectedBudgetTier('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => {
            const isAlreadyAdded =
              importedIds.has(vendor.id) ||
              existingVendorNames.some(
                (n) => n.trim().toLowerCase() === vendor.name.trim().toLowerCase()
              );
            const savings = Math.max(0, vendor.quotation - vendor.negotiatedPrice);

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-charcoal-100 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Category & Budget Tier Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                      {vendor.category.replace('_', ' ')}
                    </span>
                    {getTierBadge(vendor.budgetTier)}
                  </div>

                  {/* Vendor Name & Rating */}
                  <div>
                    <h4 className="text-base font-serif font-bold text-charcoal leading-snug">
                      {vendor.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {vendor.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                        {vendor.city}
                      </span>
                      {vendor.maxGuestCapacity && (
                        <span className="flex items-center gap-1 text-charcoal-500">
                          <Users className="w-3.5 h-3.5 text-charcoal-400" />
                          Up to {vendor.maxGuestCapacity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                    {vendor.description}
                  </p>

                  {/* Specialties Pills */}
                  {vendor.specialties && vendor.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-background-subtle text-charcoal-600 px-2 py-0.5 rounded-md border border-charcoal-200/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing Box */}
                  <div className="p-3 rounded-xl bg-background-subtle/80 border border-charcoal-100 text-xs space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-charcoal-500 font-medium">Standard Quotation</span>
                      <span className="font-bold text-charcoal text-sm">
                        {formatCurrency(vendor.quotation, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-[11px] text-emerald-700 font-semibold">
                      <span>Est. Negotiated Price</span>
                      <span>{formatCurrency(vendor.negotiatedPrice, currency)}</span>
                    </div>

                    {savings > 0 && (
                      <div className="text-[10px] text-charcoal-400 pt-1 border-t border-charcoal-200/50 flex justify-between">
                        <span>Potential event savings</span>
                        <span className="text-emerald-600 font-bold">~{formatCurrency(savings, currency)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-charcoal-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs text-charcoal-500">
                    <span className="text-[11px] font-medium text-charcoal-400">
                      Direct Contact
                    </span>
                    <div className="flex items-center gap-1 text-charcoal-500">
                      {vendor.phone && sanitizeTelUri(vendor.phone) && (
                        <a
                          href={`tel:${sanitizeTelUri(vendor.phone)}`}
                          title={`Call ${vendor.phone}`}
                          aria-label={`Call ${vendor.name} at ${vendor.phone}`}
                          className="p-1.5 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {vendor.email && sanitizeMailtoUri(vendor.email) && (
                        <a
                          href={`mailto:${sanitizeMailtoUri(vendor.email)}`}
                          title={`Email ${vendor.email}`}
                          aria-label={`Email ${vendor.name} at ${vendor.email}`}
                          className="p-1.5 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {vendor.website && isSafeHttpUrl(vendor.website) && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visit Website"
                          aria-label={`Visit ${vendor.name} website`}
                          className="p-1.5 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCustomizeVendor(vendor)}
                      title="Adjust quotation or add custom notes before adding"
                      className="text-xs px-2.5 py-1.5 shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Quote
                    </Button>

                    <Button
                      size="sm"
                      variant={isAlreadyAdded ? 'outline' : 'primary'}
                      disabled={isAlreadyAdded || importingId === vendor.id}
                      onClick={() => handleImport(vendor)}
                      loading={importingId === vendor.id}
                      className="text-xs px-3 py-1.5 flex-1 justify-center min-w-0"
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                          <span className="truncate">Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span className="truncate">Add to Event</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
