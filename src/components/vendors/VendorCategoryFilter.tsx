import React from 'react';
import { VENDOR_CATEGORIES } from '../../constants/categories';

export const VendorCategoryFilter: React.FC<{
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
          selectedCategory === 'all'
            ? 'bg-primary text-white shadow-sm'
            : 'bg-background-subtle text-charcoal-600 hover:bg-charcoal-100'
        }`}
      >
        All Categories
      </button>

      {VENDOR_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === cat.id
              ? 'bg-primary text-white shadow-sm'
              : 'bg-background-subtle text-charcoal-600 hover:bg-charcoal-100'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

