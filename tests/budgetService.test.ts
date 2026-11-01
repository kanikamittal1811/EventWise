import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { EventService } from '../src/services/event/eventService';
import { BudgetService } from '../src/services/budget/budgetService';

describe('BudgetService Unit Tests (Offline / Local Mode)', () => {
  let eventId: string;

  beforeEach(async () => {
    const storage = setupLocalStorageMock();
    storage.clear();

    eventId = await EventService.createEvent(
      'user_123',
      {
        name: 'Corporate Summit 2027',
        category: 'corporate',
        description: 'Annual tech leadership conference',
        location: 'Bengaluru',
        eventDate: '2027-05-10',
        guestCount: 500,
        totalBudget: 5000000,
        currency: 'INR',
      },
      false
    );
  });

  it('updates total budget and prevents negative budget amounts', async () => {
    await BudgetService.setTotalBudget(eventId, 6500000);
    let event = await EventService.getEvent(eventId);
    expect(event?.totalBudget).toBe(6500000);
    expect(event?.budget?.total).toBe(6500000);

    // Negative budget should be bounded to 0
    await BudgetService.setTotalBudget(eventId, -1000);
    event = await EventService.getEvent(eventId);
    expect(event?.totalBudget).toBe(0);
    expect(event?.budget?.total).toBe(0);
  });

  it('adds and updates budget categories with rounded currencies', async () => {
    const catId = await BudgetService.addCategory(eventId, {
      name: 'Keynote Stage AV',
      allocatedAmount: 750000.45,
      color: '#EC4899',
      notes: 'Includes LED walls and livestreaming rig',
    });

    expect(catId).toMatch(/^cat_/);
    let event = await EventService.getEvent(eventId);
    const cat = event?.budget?.categories?.[catId];
    expect(cat).toBeDefined();
    expect(cat?.name).toBe('Keynote Stage AV');
    expect(cat?.allocatedAmount).toBe(750000.45); // preserves 2-decimal monetary precision
    expect(cat?.color).toBe('#EC4899');

    // Update category
    await BudgetService.updateCategory(eventId, catId, {
      allocatedAmount: 850000,
      name: 'Keynote AV & Production',
    });

    event = await EventService.getEvent(eventId);
    expect(event?.budget?.categories?.[catId]?.allocatedAmount).toBe(850000);
    expect(event?.budget?.categories?.[catId]?.name).toBe('Keynote AV & Production');
  });

  it('deletes a budget category', async () => {
    const catId = await BudgetService.addCategory(eventId, {
      name: 'Temporary Category',
      allocatedAmount: 50000,
    });

    let event = await EventService.getEvent(eventId);
    expect(event?.budget?.categories?.[catId]).toBeDefined();

    await BudgetService.deleteCategory(eventId, catId);
    event = await EventService.getEvent(eventId);
    expect(event?.budget?.categories?.[catId]).toBeUndefined();
  });

  it('adds, updates, and deletes expenses', async () => {
    const catId = await BudgetService.addCategory(eventId, {
      name: 'Catering',
      allocatedAmount: 1200000,
    });

    const expId = await BudgetService.addExpense(eventId, {
      title: 'Executive Lunch Buffet Deposit',
      categoryId: catId,
      amount: 400000,
      paidAmount: 200000,
      status: 'partial',
      dueDate: '2027-04-15',
    });

    expect(expId).toMatch(/^exp_/);
    let event = await EventService.getEvent(eventId);
    let exp = event?.budget?.expenses?.[expId];
    expect(exp).toBeDefined();
    expect(exp?.title).toBe('Executive Lunch Buffet Deposit');
    expect(exp?.amount).toBe(400000);
    expect(exp?.paidAmount).toBe(200000);
    expect(exp?.status).toBe('partial');

    // Update expense to fully paid
    await BudgetService.updateExpense(eventId, expId, {
      paidAmount: 400000,
      status: 'paid',
      paidDate: '2027-04-10',
    });

    event = await EventService.getEvent(eventId);
    exp = event?.budget?.expenses?.[expId];
    expect(exp?.paidAmount).toBe(400000);
    expect(exp?.status).toBe('paid');
    expect(exp?.paidDate).toBe('2027-04-10');

    // Delete expense
    await BudgetService.deleteExpense(eventId, expId);
    event = await EventService.getEvent(eventId);
    expect(event?.budget?.expenses?.[expId]).toBeUndefined();
  });

  it('applies an AI-generated budget allocation plan', async () => {
    const aiAllocations = [
      { category: 'Venue & Logistics', allocatedAmount: 1800000, color: '#3B82F6', reason: 'High-end convention center' },
      { category: 'Keynote Speakers', allocatedAmount: 1200000, color: '#10B981', reason: 'Honorariums and travel' },
      { category: 'Catering & Dining', allocatedAmount: 1000000, color: '#F59E0B', reason: 'Full day executive menu' },
      { category: 'Marketing & PR', allocatedAmount: 500000, color: '#8B5CF6', reason: 'B2B digital promotion' },
      { category: 'Contingency', allocatedAmount: 500000, color: '#EF4444', reason: '10% emergency buffer' },
    ];

    await BudgetService.applyAiBudgetPlan(eventId, aiAllocations);

    const event = await EventService.getEvent(eventId);
    const categories = Object.values(event?.budget?.categories || {});
    expect(categories.length).toBe(5);

    const venue = categories.find((c) => c.name === 'Venue & Logistics');
    expect(venue).toBeDefined();
    expect(venue?.allocatedAmount).toBe(1800000);
    expect(venue?.color).toBe('#3B82F6');
  });
});
