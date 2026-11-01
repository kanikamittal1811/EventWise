import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  Trash2,
  Edit2,
  CheckCircle2,
  TrendingDown,
  Store,
  Plus,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useVendors } from '../../hooks/useVendors';
import { useEvent } from '../../hooks/useEvent';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { VendorCategoryFilter } from './VendorCategoryFilter';
import { VendorCatalogBrowser } from './VendorCatalogBrowser';
import { formatCurrency } from '../../utils/formatters';
import { isSafeHttpUrl, sanitizeTelUri, sanitizeMailtoUri } from '../../utils/security';
import { Vendor } from '../../types/vendor';
import { CatalogVendor } from '../../types/vendorCatalog';

export const VendorList: React.FC<{
  onAddNew: () => void;
  onEdit: (vendor: Vendor) => void;
  onCustomizeCatalogVendor: (vendor: CatalogVendor) => void;
}> = ({ onAddNew, onEdit, onCustomizeCatalogVendor }) => {
  const { vendors, addVendor, deleteVendor, updateVendor } = useVendors();
  const { event } = useEvent();
  const [activeTab, setActiveTab] = useState<'my_vendors' | 'catalog'>('my_vendors');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [justAddedName, setJustAddedName] = useState<string | null>(null);

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory === 'all') return true;
    return v.category === selectedCategory;
  });

  const currency = event?.currency || 'INR';

  const handleImportFromCatalog = async (catalogVendor: CatalogVendor) => {
    await addVendor({
      name: catalogVendor.name,
      category: catalogVendor.category,
      quotation: catalogVendor.quotation,
      negotiatedPrice: catalogVendor.negotiatedPrice,
      bookingStatus: 'shortlisted',
      paymentStatus: 'unpaid',
      contactName: catalogVendor.contactName,
      phone: catalogVendor.phone,
      email: catalogVendor.email,
      website: catalogVendor.website,
      address: catalogVendor.address,
      notes: `${catalogVendor.description} | Specialties: ${catalogVendor.specialties.join(', ')}`,
      rating: Math.round(catalogVendor.rating),
    });

    setJustAddedName(catalogVendor.name);
    setTimeout(() => setJustAddedName(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Level View Selector: My Vendors vs Curated Directory */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-charcoal-100 shadow-subtle">
        <div className="flex items-center gap-2 p-1 bg-background-subtle rounded-xl">
          <button
            onClick={() => setActiveTab('my_vendors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_vendors'
                ? 'bg-white text-charcoal shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-primary" />
            My Event Vendors
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                vendors.length > 0
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-charcoal-100 text-charcoal-500'
              }`}
            >
              {vendors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-charcoal shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal'
            }`}
          >
            <Store className="w-4 h-4 text-amber-600" />
            Curated Vendor Directory
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              34 Available
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {activeTab === 'my_vendors' && (
            <Button
              onClick={() => setActiveTab('catalog')}
              variant="outline"
              size="sm"
              icon={Store}
              className="text-xs"
            >
              Browse Directory
            </Button>
          )}

          <Button
            onClick={onAddNew}
            variant="primary"
            size="sm"
            icon={Plus}
            className="text-xs shrink-0"
          >
            + Add Custom Quote
          </Button>
        </div>
      </div>

      {/* Confirmation feedback when vendor is imported */}
      {justAddedName && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Successfully added <strong className="font-semibold">{justAddedName}</strong> to your event!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('my_vendors')}
            className="text-emerald-700 underline font-semibold hover:text-emerald-900 ml-4"
          >
            View in My Vendors →
          </button>
        </div>
      )}

      {/* TAB 1: CURATED DIRECTORY */}
      {activeTab === 'catalog' && (
        <VendorCatalogBrowser
          onImportVendor={handleImportFromCatalog}
          onCustomizeVendor={onCustomizeCatalogVendor}
          existingVendorNames={vendors.map((v) => v.name)}
          currency={currency}
        />
      )}

      {/* TAB 2: MY EVENT VENDORS */}
      {activeTab === 'my_vendors' && (
        <div className="space-y-4">
          {/* Category Filter Toolbar */}
          {vendors.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-charcoal-100 shadow-subtle">
              <VendorCategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              <div className="text-xs text-charcoal-500 shrink-0 self-center">
                Showing {filteredVendors.length} of {vendors.length} vendors
              </div>
            </div>
          )}

          {vendors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-8 shadow-subtle text-center max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-serif font-bold text-charcoal">
                  No vendors added to your event yet
                </h3>
                <p className="text-xs text-charcoal-500 max-w-md mx-auto leading-relaxed">
                  Choose from our curated directory with realistic Indian vendor quotes across various budgets (Venues, Caterers, Photographers, DJs, Decorators), or enter your own custom quotes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => setActiveTab('catalog')}
                  variant="primary"
                  icon={Store}
                  className="w-full sm:w-auto"
                >
                  Browse 34+ Curated Vendors
                </Button>
                <Button
                  onClick={onAddNew}
                  variant="outline"
                  icon={Plus}
                  className="w-full sm:w-auto"
                >
                  Enter Your Own Quote
                </Button>
              </div>
            </div>
          ) : filteredVendors.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No vendors found for this category"
              description={`No vendors currently recorded under "${selectedCategory.replace('_', ' ')}".`}
              actionLabel="View All Categories"
              onAction={() => setSelectedCategory('all')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map((vendor) => {
                const savings = Math.max(0, vendor.quotation - vendor.negotiatedPrice);

                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-2xl border border-charcoal-100 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-200">
                          {vendor.category.replace('_', ' ')}
                        </span>
                        <Badge
                          variant={
                            vendor.bookingStatus === 'booked'
                              ? 'success'
                              : vendor.bookingStatus === 'negotiating'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {vendor.bookingStatus}
                        </Badge>
                      </div>

                      <h4 className="text-base font-serif font-bold text-charcoal truncate">
                        {vendor.name}
                      </h4>
                      {vendor.contactName && (
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          Contact: {vendor.contactName}
                        </p>
                      )}

                      {/* Pricing info */}
                      <div className="mt-3.5 p-3 rounded-xl bg-background-subtle/70 border border-charcoal-100/70 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="text-charcoal-500">Negotiated Price</span>
                          <span className="font-bold text-charcoal text-sm">
                            {formatCurrency(vendor.negotiatedPrice || vendor.quotation, currency)}
                          </span>
                        </div>

                        {vendor.quotation > vendor.negotiatedPrice && (
                          <div className="mt-1 flex justify-between items-center text-[11px] text-emerald-700">
                            <span className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" /> Saved via negotiation
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(savings, currency)}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-charcoal-200/50 flex justify-between items-center text-[11px]">
                          <span className="text-charcoal-400">Payment Status</span>
                          <span className="font-semibold text-charcoal capitalize">
                            {vendor.paymentStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {vendor.notes && (
                        <p className="mt-3 text-xs text-charcoal-500 line-clamp-2 italic">
                          &quot;{vendor.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-600">
                      <div className="flex items-center gap-2">
                        {vendor.phone && sanitizeTelUri(vendor.phone) && (
                          <a
                            href={`tel:${sanitizeTelUri(vendor.phone)}`}
                            title={vendor.phone}
                            aria-label={`Call ${vendor.name} at ${vendor.phone}`}
                            className="p-1.5 hover:text-primary hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                        {vendor.email && sanitizeMailtoUri(vendor.email) && (
                          <a
                            href={`mailto:${sanitizeMailtoUri(vendor.email)}`}
                            title={vendor.email}
                            aria-label={`Email ${vendor.name} at ${vendor.email}`}
                            className="p-1.5 hover:text-primary hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                        {vendor.website && isSafeHttpUrl(vendor.website) && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Website"
                            aria-label={`Visit ${vendor.name} website`}
                            className="p-1.5 hover:text-primary hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(vendor)}
                          title="Edit vendor"
                          aria-label={`Edit vendor ${vendor.name}`}
                          className="p-1.5 hover:text-charcoal hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVendor(vendor.id)}
                          title="Delete vendor"
                          aria-label={`Delete vendor ${vendor.name}`}
                          className="p-1.5 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
