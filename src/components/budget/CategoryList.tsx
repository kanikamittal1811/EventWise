import React from 'react';
import { Trash2, Edit2, Tag } from 'lucide-react';
import { useBudget } from '../../hooks/useBudget';
import { formatCurrency } from '../../utils/formatters';
import { calculateCategorySpend } from '../../utils/calculations';
import { useEvent } from '../../hooks/useEvent';

export const CategoryList: React.FC<{
  onEditCategory: (category: any) => void;
}> = ({ onEditCategory }) => {
  const { categories, deleteCategory, currency } = useBudget();
  const { event } = useEvent();

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-charcoal-400 bg-background-subtle/50 rounded-2xl border border-charcoal-100">
        No budget categories configured yet. Click &quot;Add Category&quot; or generate with AI.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const spend = calculateCategorySpend(cat.id, event?.budget?.expenses || {});
        const percentage = cat.allocatedAmount > 0
          ? Math.min(100, Math.round((spend.totalPaidAmount / cat.allocatedAmount) * 100))
          : 0;

        return (
          <div
            key={cat.id}
            className="p-4 rounded-2xl bg-white border border-charcoal-100 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  aria-hidden="true"
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#6366F1' }}
                />
                <h4 className="text-sm font-semibold text-charcoal truncate">{cat.name}</h4>
              </div>
              <div className="flex items-center gap-1 text-charcoal-400">
                <button
                  type="button"
                  onClick={() => onEditCategory(cat)}
                  aria-label={`Edit ${cat.name} category`}
                  className="p-1 hover:text-charcoal hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  aria-label={`Delete ${cat.name} category`}
                  className="p-1 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex justify-between items-baseline text-xs">
              <span className="text-charcoal-600">Allocated</span>
              <span className="font-bold text-charcoal">
                {formatCurrency(cat.allocatedAmount, currency)}
              </span>
            </div>

            <div className="mt-1 flex justify-between items-baseline text-xs">
              <span className="text-charcoal-600">Paid so far</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(spend.totalPaidAmount, currency)}
              </span>
            </div>

            {/* Micro progress bar */}
            <div
              role="progressbar"
              aria-label={`${cat.name} budget utilized`}
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2.5 w-full h-1.5 bg-charcoal-100 rounded-full overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: cat.color || '#6366F1',
                }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-charcoal-500">
              {percentage}% utilized
            </div>
          </div>
        );
      })}
    </div>
  );
};

