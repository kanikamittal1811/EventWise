import React from 'react';
import { Trash2, CheckCircle2, Clock, DollarSign, Calendar } from 'lucide-react';
import { useBudget } from '../../hooks/useBudget';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ExpenseTracker: React.FC<{
  onEditExpense: (expense: any) => void;
}> = ({ onEditExpense }) => {
  const { expenses, categories, deleteExpense, updateExpense, currency } = useBudget();

  const getCategoryName = (categoryId: string) => {
    const found = categories.find((c) => c.id === categoryId);
    return found?.name || 'Uncategorized';
  };

  const getCategoryColor = (categoryId: string) => {
    const found = categories.find((c) => c.id === categoryId);
    return found?.color || '#6366F1';
  };

  if (expenses.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-charcoal-400 bg-background-subtle/50 rounded-2xl border border-charcoal-100">
        No expenses recorded yet. Click &quot;Record Expense&quot; to log vendor deposits and bills.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">
            List of event expenses, categories, paid status, and actions
          </caption>
          <thead className="bg-background-subtle/80 border-b border-charcoal-100 text-charcoal-600 font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4">Item / Description</th>
              <th scope="col" className="py-3.5 px-4">Category</th>
              <th scope="col" className="py-3.5 px-4 text-right">Total Amount</th>
              <th scope="col" className="py-3.5 px-4 text-right">Paid Amount</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Due Date</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-background-subtle/40 transition-colors">
                <th scope="row" className="py-3.5 px-4 font-normal text-left">
                  <div className="font-semibold text-charcoal text-sm">{exp.title}</div>
                  {exp.notes && <div className="text-[11px] text-charcoal-500 truncate max-w-xs">{exp.notes}</div>}
                </th>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-subtle text-charcoal-700 font-medium text-[11px]">
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(exp.categoryId) }}
                    />
                    {getCategoryName(exp.categoryId)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-charcoal whitespace-nowrap">
                  {formatCurrency(exp.amount, currency)}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 whitespace-nowrap">
                  {formatCurrency(exp.paidAmount, currency)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge
                    variant={
                      exp.status === 'paid'
                        ? 'success'
                        : exp.status === 'partial'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {exp.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                  {exp.dueDate ? formatDate(exp.dueDate) : '-'}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-charcoal-400">
                    {exp.status !== 'paid' && (
                      <button
                        type="button"
                        title="Mark Fully Paid"
                        aria-label={`Mark expense "${exp.title}" as fully paid`}
                        onClick={() =>
                          updateExpense(exp.id, {
                            status: 'paid',
                            paidAmount: exp.amount,
                            paidDate: new Date().toISOString(),
                          })
                        }
                        className="p-1 hover:text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete expense"
                      aria-label={`Delete expense "${exp.title}"`}
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

