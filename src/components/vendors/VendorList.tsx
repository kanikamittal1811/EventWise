import React, { useState } from 'react';
import { Phone, Mail, Globe, Trash2, Edit2, CheckCircle2, TrendingDown, Store } from 'lucide-react';
import { useVendors } from '../../hooks/useVendors';
import { useEvent } from '../../hooks/useEvent';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { VendorCategoryFilter } from './VendorCategoryFilter';
import { formatCurrency } from '../../utils/formatters';
import { isSafeHttpUrl, sanitizeTelUri, sanitizeMailtoUri } from '../../utils/security';
import { Vendor } from '../../types/vendor';

export const VendorList: React.FC<{
  onAddNew: () => void;
  onEdit: (vendor: Vendor) => void;
}> = ({ onAddNew, onEdit }) => {
  const { vendors, deleteVendor, updateVendor } = useVendors();
  const { event } = useEvent();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory === 'all') return true;
    return v.category === selectedCategory;
  });

  const currency = event?.currency || 'INR';

  return (
    <div className="space-y-4">
      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-charcoal-100 shadow-subtle">
        <VendorCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <Button onClick={onAddNew} variant="primary" size="sm" className="shrink-0">
          + Add Vendor
        </Button>
      </div>

      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description={
            selectedCategory === 'all'
              ? 'Start tracking vendor quotations, contracts, and contact details.'
              : `No vendors recorded under the ${selectedCategory} category yet.`
          }
          actionLabel="Add First Vendor"
          onAction={onAddNew}
          aiSuggestedPrompt="Suggest 5 key questions to ask a wedding venue manager before signing"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const savings = Math.max(0, vendor.quotation - vendor.negotiatedPrice);

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-charcoal-100 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
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
                    <p className="text-xs text-charcoal-500 mt-0.5">Contact: {vendor.contactName}</p>
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
                        <span className="font-semibold">{formatCurrency(savings, currency)}</span>
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
                        aria-label={`Visit ${vendor.name} website (opens in new tab)`}
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
  );
};

