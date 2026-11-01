import { BudgetCategory, Expense, BudgetSummary } from '../types/budget';
import { Guest, GuestSummary } from '../types/guest';
import { Task } from '../types/task';

/**
 * Deterministic monetary calculations.
 * Always handles floating point precision using cents / 2-decimal rounding.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateBudgetSummary(
  totalBudget: number,
  categories: Record<string, BudgetCategory> = {},
  expenses: Record<string, Expense> = {}
): BudgetSummary {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);

  // Sum allocated across all categories
  const totalAllocated = Object.values(categories).reduce((acc, cat) => {
    return roundCurrency(acc + (Number(cat.allocatedAmount) || 0));
  }, 0);

  // Calculate actual spend from expenses
  let totalSpent = 0;
  let totalPending = 0;

  Object.values(expenses).forEach((exp) => {
    const amount = Number(exp.amount) || 0;
    const paid = Number(exp.paidAmount) || 0;

    totalSpent = roundCurrency(totalSpent + paid);
    if (amount > paid) {
      totalPending = roundCurrency(totalPending + (amount - paid));
    }
  });

  const totalUnallocated = roundCurrency(Math.max(0, safeTotalBudget - totalAllocated));
  const remainingBudget = roundCurrency(safeTotalBudget - totalSpent);
  const percentageUsed = safeTotalBudget > 0
    ? Math.min(100, roundCurrency((totalSpent / safeTotalBudget) * 100))
    : 0;

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalUnallocated,
    totalSpent,
    totalPending,
    remainingBudget,
    percentageUsed,
  };
}

export interface CategorySpend {
  totalExpenseAmount: number;
  totalPaidAmount: number;
  pendingAmount: number;
}

/**
 * Pre-aggregates spending across all categories in a single O(E) pass.
 * Prevents O(C * E) quadratic iteration in list components.
 */
export function calculateAllCategoriesSpend(
  expenses: Record<string, Expense> = {}
): Record<string, CategorySpend> {
  const result: Record<string, CategorySpend> = {};

  Object.values(expenses).forEach((exp) => {
    const catId = exp.categoryId;
    if (!catId) return;

    if (!result[catId]) {
      result[catId] = {
        totalExpenseAmount: 0,
        totalPaidAmount: 0,
        pendingAmount: 0,
      };
    }

    const amount = Number(exp.amount) || 0;
    const paid = Number(exp.paidAmount) || 0;

    result[catId].totalExpenseAmount = roundCurrency(result[catId].totalExpenseAmount + amount);
    result[catId].totalPaidAmount = roundCurrency(result[catId].totalPaidAmount + paid);
  });

  for (const catId of Object.keys(result)) {
    result[catId].pendingAmount = roundCurrency(
      Math.max(0, result[catId].totalExpenseAmount - result[catId].totalPaidAmount)
    );
  }

  return result;
}

export function calculateCategorySpend(
  categoryId: string,
  expenses: Record<string, Expense> = {}
): CategorySpend {
  let totalExpenseAmount = 0;
  let totalPaidAmount = 0;

  Object.values(expenses).forEach((exp) => {
    if (exp.categoryId === categoryId) {
      const amount = Number(exp.amount) || 0;
      const paid = Number(exp.paidAmount) || 0;
      totalExpenseAmount = roundCurrency(totalExpenseAmount + amount);
      totalPaidAmount = roundCurrency(totalPaidAmount + paid);
    }
  });

  const pendingAmount = roundCurrency(Math.max(0, totalExpenseAmount - totalPaidAmount));

  return {
    totalExpenseAmount,
    totalPaidAmount,
    pendingAmount,
  };
}

export function calculateGuestMetrics(guests: Record<string, Guest> = {}): GuestSummary {
  const guestList = Object.values(guests);
  let totalInvited = 0;
  let totalAttending = 0;
  let totalDeclined = 0;
  let totalPending = 0;
  let totalPlusOnes = 0;
  const dietaryBreakdown: Record<string, number> = {};

  guestList.forEach((guest) => {
    const plus = Number(guest.plusOnes) || 0;
    totalPlusOnes += plus;
    const headcount = 1 + plus;
    totalInvited += headcount;

    if (guest.rsvpStatus === 'attending') {
      totalAttending += headcount;
    } else if (guest.rsvpStatus === 'declined') {
      totalDeclined += headcount;
    } else {
      totalPending += headcount;
    }

    if (guest.dietaryPreferences && guest.dietaryPreferences.trim() !== '') {
      const diet = guest.dietaryPreferences.trim().toLowerCase();
      dietaryBreakdown[diet] = (dietaryBreakdown[diet] || 0) + headcount;
    }
  });

  return {
    totalInvited,
    totalAttending,
    totalDeclined,
    totalPending,
    totalPlusOnes,
    dietaryBreakdown,
  };
}

export function calculateTaskProgress(tasks: Record<string, Task> = {}): {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentage: number;
} {
  const taskList = Object.values(tasks);
  const total = taskList.length;
  if (total === 0) {
    return { total: 0, completed: 0, inProgress: 0, pending: 0, percentage: 0 };
  }

  const completed = taskList.filter((t) => t.status === 'completed').length;
  const inProgress = taskList.filter((t) => t.status === 'in_progress').length;
  const pending = taskList.filter((t) => t.status === 'todo').length;
  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    inProgress,
    pending,
    percentage,
  };
}

