import { describe, it, expect } from 'vitest';
import {
  aiEventPlanSchema,
  aiBudgetOptimizationSchema,
  aiGeneratedTasksSchema,
} from '../src/schemas/ai.schema';
import { eventSchema } from '../src/schemas/event.schema';
import { expenseSchema } from '../src/schemas/budget.schema';

describe('Zod Schema Validations', () => {
  it('validates a complete AI event plan response', () => {
    const mockPlan = {
      eventOverview: {
        name: 'Royal Udaipur Wedding',
        category: 'wedding',
        guestCount: 200,
        estimatedBudget: 2500000,
        currency: 'INR',
        description: '3-day celebration',
        theme: 'Heritage Rose Gold',
        suggestedDurationDays: 3,
      },
      functions: [
        {
          name: 'Sangeet Night',
          relativeDay: 1,
          description: 'Music and dance',
          suggestedTiming: '7:00 PM',
        },
      ],
      budgetAllocations: [
        {
          category: 'Venue',
          allocatedAmount: 1000000,
          percentage: 40,
          reason: 'Heritage palace',
        },
        {
          category: 'Catering',
          allocatedAmount: 1500000,
          percentage: 60,
          reason: 'Buffet',
        },
      ],
      tasks: [
        {
          title: 'Book Palace',
          category: 'Venue',
          priority: 'urgent',
          relativeDeadline: '6 months before',
          description: 'Pay deposit',
        },
      ],
      recommendedVendors: [
        {
          category: 'Photography',
          estimatedCost: 300000,
          importance: 'high',
          selectionTips: 'Look for drone experience',
        },
      ],
      creativeIdeas: {
        themeTitle: 'Royal Elegance',
        colorPalette: [
          { name: 'Rose Gold', hex: '#B76E79' },
          { name: 'Ivory', hex: '#FFFFF0' },
        ],
        decorConcept: 'Marigold and fairy lights',
        cateringHighlights: ['Chaat bar', 'Kulfi station'],
        entertainmentIdeas: ['Folk singers', 'DJ set'],
      },
    };

    const result = aiEventPlanSchema.safeParse(mockPlan);
    expect(result.success).toBe(true);
  });

  it('rejects an AI event plan with missing required fields or invalid types', () => {
    const invalidPlan = {
      eventOverview: {
        name: 'Incomplete Plan',
        // missing category, guestCount, etc.
      },
    };

    const result = aiEventPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });

  it('validates budget optimization proposal schema', () => {
    const mockProposal = {
      currentTotal: 2000000,
      targetBudget: 1800000,
      proposedChanges: [
        {
          category: 'Decor',
          currentAllocation: 300000,
          proposedAllocation: 200000,
          difference: -100000,
          rationale: 'Use seasonal flowers',
          riskLevel: 'low',
        },
      ],
      summaryAdvice: 'Saved 2 Lakhs easily',
    };

    const result = aiBudgetOptimizationSchema.safeParse(mockProposal);
    expect(result.success).toBe(true);
  });

  it('validates user event creation form data and rejects negative budget', () => {
    const validData = {
      name: 'Maya & Kabir Wedding',
      category: 'wedding',
      location: 'Jaipur',
      eventDate: '2026-12-20',
      guestCount: 200,
      totalBudget: 2000000,
      currency: 'INR',
    };

    expect(eventSchema.safeParse(validData).success).toBe(true);

    const negativeBudgetData = {
      ...validData,
      totalBudget: -500,
    };
    expect(eventSchema.safeParse(negativeBudgetData).success).toBe(false);
  });

  it('validates expense creation and requires positive amount', () => {
    const validExpense = {
      categoryId: 'cat_1',
      title: 'Sound System Advance',
      amount: 45000,
      paidAmount: 20000,
      status: 'partial',
    };
    expect(expenseSchema.safeParse(validExpense).success).toBe(true);

    const zeroExpense = {
      ...validExpense,
      amount: 0,
    };
    expect(expenseSchema.safeParse(zeroExpense).success).toBe(false);
  });
});

