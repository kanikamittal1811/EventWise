import { describe, it, expect } from 'vitest';
import {
  calculateBudgetSummary,
  calculateCategorySpend,
  calculateGuestMetrics,
  calculateTaskProgress,
  roundCurrency,
} from '../src/utils/calculations';
import { BudgetCategory, Expense } from '../src/types/budget';
import { Guest } from '../src/types/guest';
import { Task } from '../src/types/task';

describe('Deterministic Financial and Metric Calculations', () => {
  it('correctly rounds currency to 2 decimal places avoiding IEEE 754 precision issues', () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    expect(roundCurrency(1999999.999)).toBe(2000000);
    expect(roundCurrency(10.555)).toBe(10.56);
  });

  it('calculates budget summary deterministically with categories and expenses', () => {
    const totalBudget = 2000000;
    const categories: Record<string, BudgetCategory> = {
      c1: { id: 'c1', name: 'Venue', allocatedAmount: 700000 },
      c2: { id: 'c2', name: 'Catering', allocatedAmount: 500000 },
    };

    const expenses: Record<string, Expense> = {
      e1: {
        id: 'e1',
        categoryId: 'c1',
        title: 'Advance',
        amount: 300000,
        paidAmount: 200000,
        status: 'partial',
        createdAt: 1,
      },
      e2: {
        id: 'e2',
        categoryId: 'c2',
        title: 'Tasting',
        amount: 50000,
        paidAmount: 50000,
        status: 'paid',
        createdAt: 2,
      },
    };

    const summary = calculateBudgetSummary(totalBudget, categories, expenses);

    expect(summary.totalBudget).toBe(2000000);
    expect(summary.totalAllocated).toBe(1200000);
    expect(summary.totalUnallocated).toBe(800000);
    expect(summary.totalSpent).toBe(250000);
    expect(summary.totalPending).toBe(100000); // 300k - 200k
    expect(summary.remainingBudget).toBe(1750000); // 2M - 250k
    expect(summary.percentageUsed).toBe(12.5);
  });

  it('handles edge case when total budget is 0 or negative', () => {
    const summary = calculateBudgetSummary(0, {}, {});
    expect(summary.totalBudget).toBe(0);
    expect(summary.percentageUsed).toBe(0);
    expect(summary.remainingBudget).toBe(0);
  });

  it('calculates category spend accurately', () => {
    const expenses: Record<string, Expense> = {
      e1: {
        id: 'e1',
        categoryId: 'venue',
        title: 'Hall Rent',
        amount: 400000,
        paidAmount: 150000,
        status: 'partial',
        createdAt: 1,
      },
      e2: {
        id: 'e2',
        categoryId: 'venue',
        title: 'Generator',
        amount: 25000,
        paidAmount: 25000,
        status: 'paid',
        createdAt: 2,
      },
      e3: {
        id: 'e3',
        categoryId: 'catering',
        title: 'Food',
        amount: 100000,
        paidAmount: 100000,
        status: 'paid',
        createdAt: 3,
      },
    };

    const spend = calculateCategorySpend('venue', expenses);
    expect(spend.totalExpenseAmount).toBe(425000);
    expect(spend.totalPaidAmount).toBe(175000);
    expect(spend.pendingAmount).toBe(250000);
  });

  it('calculates guest metrics with plus-ones and dietary preferences', () => {
    const guests: Record<string, Guest> = {
      g1: {
        id: 'g1',
        name: 'Aarav',
        category: 'family',
        rsvpStatus: 'attending',
        plusOnes: 2,
        dietaryPreferences: 'Vegetarian',
        invitationSent: true,
        createdAt: 1,
        updatedAt: 1,
      },
      g2: {
        id: 'g2',
        name: 'Rohan',
        category: 'friends',
        rsvpStatus: 'declined',
        plusOnes: 0,
        invitationSent: true,
        createdAt: 1,
        updatedAt: 1,
      },
      g3: {
        id: 'g3',
        name: 'Priya',
        category: 'colleagues',
        rsvpStatus: 'pending',
        plusOnes: 1,
        dietaryPreferences: 'Vegan',
        invitationSent: false,
        createdAt: 1,
        updatedAt: 1,
      },
    };

    const summary = calculateGuestMetrics(guests);
    expect(summary.totalInvited).toBe(6); // (1+2) + (1+0) + (1+1) = 3 + 1 + 2 = 6
    expect(summary.totalAttending).toBe(3);
    expect(summary.totalDeclined).toBe(1);
    expect(summary.totalPending).toBe(2);
    expect(summary.dietaryBreakdown['vegetarian']).toBe(3);
    expect(summary.dietaryBreakdown['vegan']).toBe(2);
  });

  it('calculates task progress accurately', () => {
    const tasks: Record<string, Task> = {
      t1: {
        id: 't1',
        title: 'Task 1',
        priority: 'high',
        status: 'completed',
        dueDate: '2026-12-01',
        createdAt: 1,
        updatedAt: 1,
      },
      t2: {
        id: 't2',
        title: 'Task 2',
        priority: 'urgent',
        status: 'in_progress',
        dueDate: '2026-12-05',
        createdAt: 1,
        updatedAt: 1,
      },
      t3: {
        id: 't3',
        title: 'Task 3',
        priority: 'medium',
        status: 'todo',
        dueDate: '2026-12-10',
        createdAt: 1,
        updatedAt: 1,
      },
      t4: {
        id: 't4',
        title: 'Task 4',
        priority: 'low',
        status: 'completed',
        dueDate: '2026-12-12',
        createdAt: 1,
        updatedAt: 1,
      },
    };

    const progress = calculateTaskProgress(tasks);
    expect(progress.total).toBe(4);
    expect(progress.completed).toBe(2);
    expect(progress.inProgress).toBe(1);
    expect(progress.pending).toBe(1);
    expect(progress.percentage).toBe(50);
  });
});

