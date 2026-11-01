import { useMemo } from 'react';
import { useEvent } from './useEvent';
import { BudgetService } from '../services/budget/budgetService';
import { BudgetCategoryFormData, ExpenseFormData } from '../schemas/budget.schema';
import { BudgetCategory, Expense } from '../types/budget';

export function useBudget() {
  const { event, budgetSummary } = useEvent();

  const categories = useMemo(() => {
    if (!event?.budget?.categories) return [];
    return Object.values(event.budget.categories);
  }, [event?.budget?.categories]);

  const expenses = useMemo(() => {
    if (!event?.budget?.expenses) return [];
    return Object.values(event.budget.expenses).sort((a, b) => b.createdAt - a.createdAt);
  }, [event?.budget?.expenses]);

  const addCategory = async (data: BudgetCategoryFormData) => {
    if (!event) return;
    return await BudgetService.addCategory(event.id, data);
  };

  const updateCategory = async (categoryId: string, updates: Partial<BudgetCategory>) => {
    if (!event) return;
    await BudgetService.updateCategory(event.id, categoryId, updates);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!event) return;
    await BudgetService.deleteCategory(event.id, categoryId);
  };

  const addExpense = async (data: ExpenseFormData) => {
    if (!event) return;
    return await BudgetService.addExpense(event.id, data);
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!event) return;
    await BudgetService.updateExpense(event.id, expenseId, updates);
  };

  const deleteExpense = async (expenseId: string) => {
    if (!event) return;
    await BudgetService.deleteExpense(event.id, expenseId);
  };

  const setTotalBudget = async (total: number) => {
    if (!event) return;
    await BudgetService.setTotalBudget(event.id, total);
  };

  const applyAiBudgetPlan = async (
    allocations: Array<{ category: string; allocatedAmount: number; color?: string; reason?: string }>
  ) => {
    if (!event) return;
    await BudgetService.applyAiBudgetPlan(event.id, allocations);
  };

  return {
    categories,
    expenses,
    summary: budgetSummary,
    currency: event?.currency || 'INR',
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    setTotalBudget,
    applyAiBudgetPlan,
  };
}

