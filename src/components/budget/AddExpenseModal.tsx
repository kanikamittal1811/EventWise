import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { BudgetCategory } from '../../types/budget';
import { ExpenseFormData } from '../../schemas/budget.schema';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Record<string, BudgetCategory> | undefined;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [status, setStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || amount <= 0 || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        categoryId,
        amount,
        paidAmount,
        status,
      });
      setTitle('');
      setCategoryId('');
      setAmount(0);
      setPaidAmount(0);
      setStatus('pending');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const categoryList = categories ? Object.values(categories) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Expense"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Description"
          placeholder="e.g. Venue Advance Deposit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-2.5 focus:outline-none"
            required
          >
            <option value="">Select Category</option>
            {categoryList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Cost"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <Input
            label="Amount Paid So Far"
            type="number"
            min="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
            Payment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'partial' | 'paid')}
            className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-2.5 focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Record Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};
