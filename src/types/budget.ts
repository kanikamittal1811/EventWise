export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  color?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  vendorId?: string;
  dueDate?: string;
  paidDate?: string;
  receiptImageId?: string;
  notes?: string;
  createdAt: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalUnallocated: number;
  totalSpent: number;
  totalPending: number;
  remainingBudget: number;
  percentageUsed: number;
}

