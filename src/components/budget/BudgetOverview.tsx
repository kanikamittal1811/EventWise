import React from 'react';
import { Wallet, TrendingUp, AlertCircle, PieChart, Plus } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useBudget } from '../../hooks/useBudget';
import { formatCurrency } from '../../utils/formatters';

interface BudgetOverviewProps {
  onOpenAddExpense: () => void;
  onOpenAddCategory: () => void;
  onOpenAiOptimizer: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  onOpenAddExpense,
  onOpenAddCategory,
  onOpenAiOptimizer,
}) => {
  const { summary, currency } = useBudget();

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide">
              Total Budget
            </span>
            <div className="p-1.5 rounded-lg bg-primary-50 text-primary">
              <Wallet className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl font-serif font-bold text-charcoal truncate">
            {formatCurrency(summary.totalBudget, currency)}
          </div>
          <div className="mt-1 text-xs text-charcoal-600">
            {formatCurrency(summary.totalAllocated, currency)} allocated
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide">
              Total Spent
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl font-serif font-bold text-charcoal truncate">
            {formatCurrency(summary.totalSpent, currency)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">
            {summary.percentageUsed}% of total budget
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide">
              Remaining Budget
            </span>
            <div className={`p-1.5 rounded-lg ${summary.remainingBudget < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              <PieChart className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className={`mt-2 text-xl font-serif font-bold truncate ${summary.remainingBudget < 0 ? 'text-red-700' : 'text-charcoal'}`}>
            {formatCurrency(summary.remainingBudget, currency)}
          </div>
          <div className="mt-1 text-xs text-charcoal-600">
            {summary.remainingBudget < 0 ? 'Over budget!' : 'Available to spend'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide">
              Pending Payments
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl font-serif font-bold text-charcoal truncate">
            {formatCurrency(summary.totalPending, currency)}
          </div>
          <div className="mt-1 text-xs text-charcoal-600">
            Booked but unpaid
          </div>
        </Card>
      </div>

      {/* Progress Bar & Actions */}
      <Card className="p-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-charcoal">Budget Utilization</span>
              <span className="font-bold text-charcoal">{summary.percentageUsed}% Spent</span>
            </div>
            <div
              role="progressbar"
              aria-label="Budget Utilization"
              aria-valuenow={Math.round(summary.percentageUsed)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-3 bg-charcoal-100 rounded-full overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  summary.percentageUsed > 100
                    ? 'bg-red-500'
                    : summary.percentageUsed > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.percentageUsed)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onOpenAddExpense} variant="primary" size="sm" icon={Plus}>
              Record Expense
            </Button>
            <Button onClick={onOpenAddCategory} variant="outline" size="sm" icon={Plus}>
              Add Category
            </Button>
            <Button onClick={onOpenAiOptimizer} variant="secondary" size="sm">
              ✨ AI Optimizer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

