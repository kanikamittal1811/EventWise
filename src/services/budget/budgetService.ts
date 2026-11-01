import { ref, set, update, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { BudgetCategory, Expense } from '../../types/budget';
import { BudgetCategoryFormData, ExpenseFormData } from '../../schemas/budget.schema';
import { roundCurrency } from '../../utils/calculations';
import { LOCAL_EVENTS_KEY, notifyLocalEventsChanged, getLocalDemoEvents } from '../../constants/dummyData';

function getLocalEvents(): any {
  return getLocalDemoEvents();
}

function saveLocalEvents(events: any) {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[BudgetService] Failed to write localStorage:', err);
  }
  notifyLocalEventsChanged();
}

export const BudgetService = {
  async setTotalBudget(eventId: string, total: number): Promise<void> {
    const safeTotal = roundCurrency(Math.max(0, total));

    const events = getLocalEvents();
    if (events[eventId]) {
      events[eventId].totalBudget = safeTotal;
      if (!events[eventId].budget) events[eventId].budget = { total: safeTotal };
      events[eventId].budget.total = safeTotal;
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}`), {
        totalBudget: safeTotal,
        'budget/total': safeTotal,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn(`[BudgetService] Firebase setTotalBudget failed for ${eventId}:`, err);
    }
  },

  async addCategory(eventId: string, data: BudgetCategoryFormData): Promise<string> {
    const catId = `cat_${Date.now()}`;
    const category: BudgetCategory = {
      id: catId,
      name: data.name,
      allocatedAmount: roundCurrency(data.allocatedAmount),
      color: data.color || '#6366F1',
      notes: data.notes || '',
    };

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].budget) events[eventId].budget = { total: events[eventId].totalBudget || 0 };
      if (!events[eventId].budget.categories) events[eventId].budget.categories = {};
      events[eventId].budget.categories[catId] = category;
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return catId;
    }

    try {
      await set(ref(database, `events/${eventId}/budget/categories/${catId}`), category);
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase addCategory failed for ${eventId}:`, err);
    }
    return catId;
  },

  async updateCategory(
    eventId: string,
    categoryId: string,
    updates: Partial<BudgetCategory>
  ): Promise<void> {
    const safeUpdates: Partial<BudgetCategory> = { ...updates };
    if (safeUpdates.allocatedAmount !== undefined) {
      safeUpdates.allocatedAmount = roundCurrency(safeUpdates.allocatedAmount);
    }

    const events = getLocalEvents();
    if (events[eventId]?.budget?.categories?.[categoryId]) {
      events[eventId].budget.categories[categoryId] = {
        ...events[eventId].budget.categories[categoryId],
        ...safeUpdates,
      };
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}/budget/categories/${categoryId}`), safeUpdates);
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase updateCategory failed:`, err);
    }
  },

  async deleteCategory(eventId: string, categoryId: string): Promise<void> {
    const events = getLocalEvents();
    if (events[eventId]?.budget?.categories?.[categoryId]) {
      delete events[eventId].budget.categories[categoryId];
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await remove(ref(database, `events/${eventId}/budget/categories/${categoryId}`));
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase deleteCategory failed:`, err);
    }
  },

  async addExpense(eventId: string, data: ExpenseFormData): Promise<string> {
    const expId = `exp_${Date.now()}`;
    const amount = roundCurrency(data.amount);
    const paidAmount = roundCurrency(data.paidAmount);

    const expense: Expense = {
      id: expId,
      categoryId: data.categoryId,
      title: data.title,
      amount,
      paidAmount,
      status: data.status,
      vendorId: data.vendorId || '',
      dueDate: data.dueDate || '',
      paidDate: data.paidDate || '',
      notes: data.notes || '',
      createdAt: Date.now(),
    };

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].budget) events[eventId].budget = { total: events[eventId].totalBudget || 0 };
      if (!events[eventId].budget.expenses) events[eventId].budget.expenses = {};
      events[eventId].budget.expenses[expId] = expense;
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return expId;
    }

    try {
      await set(ref(database, `events/${eventId}/budget/expenses/${expId}`), expense);
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase addExpense failed:`, err);
    }
    return expId;
  },

  async updateExpense(
    eventId: string,
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<void> {
    const safeUpdates = { ...updates };
    if (safeUpdates.amount !== undefined) safeUpdates.amount = roundCurrency(safeUpdates.amount);
    if (safeUpdates.paidAmount !== undefined) safeUpdates.paidAmount = roundCurrency(safeUpdates.paidAmount);

    const events = getLocalEvents();
    if (events[eventId]?.budget?.expenses?.[expenseId]) {
      events[eventId].budget.expenses[expenseId] = {
        ...events[eventId].budget.expenses[expenseId],
        ...safeUpdates,
      };
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}/budget/expenses/${expenseId}`), safeUpdates);
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase updateExpense failed:`, err);
    }
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<void> {
    const events = getLocalEvents();
    if (events[eventId]?.budget?.expenses?.[expenseId]) {
      delete events[eventId].budget.expenses[expenseId];
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await remove(ref(database, `events/${eventId}/budget/expenses/${expenseId}`));
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase deleteExpense failed:`, err);
    }
  },

  async applyAiBudgetPlan(
    eventId: string,
    allocations: Array<{ category: string; allocatedAmount: number; color?: string; reason?: string }>
  ): Promise<void> {
    const categoriesMap: Record<string, BudgetCategory> = {};
    allocations.forEach((item, index) => {
      const catId = `cat_${index}_${item.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      categoriesMap[catId] = {
        id: catId,
        name: item.category,
        allocatedAmount: roundCurrency(item.allocatedAmount),
        color: item.color || '#6366F1',
        notes: item.reason || '',
      };
    });

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].budget) events[eventId].budget = { total: events[eventId].totalBudget };
      events[eventId].budget.categories = categoriesMap;
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await set(ref(database, `events/${eventId}/budget/categories`), categoriesMap);
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[BudgetService] Firebase applyAiBudgetPlan failed:`, err);
    }
  },
};

