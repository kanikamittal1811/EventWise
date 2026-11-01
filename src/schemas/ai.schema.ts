import { z } from 'zod';

export const aiEventPlanSchema = z.object({
  eventOverview: z.object({
    name: z.string(),
    category: z.enum([
      'wedding',
      'birthday',
      'engagement',
      'anniversary',
      'baby_shower',
      'corporate',
      'community',
      'festival',
      'custom',
    ]),
    guestCount: z.number().int().positive(),
    estimatedBudget: z.number().nonnegative(),
    currency: z.string().default('INR'),
    description: z.string(),
    theme: z.string(),
    suggestedDurationDays: z.number().default(1),
  }),
  functions: z.array(
    z.object({
      name: z.string(),
      relativeDay: z.number(),
      description: z.string(),
      suggestedTiming: z.string(),
    })
  ).default([]),
  budgetAllocations: z.array(
    z.object({
      category: z.string(),
      allocatedAmount: z.number().nonnegative(),
      percentage: z.number().min(0).max(100),
      reason: z.string(),
    })
  ),
  tasks: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      relativeDeadline: z.string(),
      description: z.string(),
    })
  ),
  recommendedVendors: z.array(
    z.object({
      category: z.string(),
      estimatedCost: z.number().nonnegative(),
      importance: z.enum(['essential', 'high', 'medium', 'nice_to_have']),
      selectionTips: z.string(),
    })
  ),
  creativeIdeas: z.object({
    themeTitle: z.string(),
    colorPalette: z.array(
      z.object({
        name: z.string(),
        hex: z.string(),
      })
    ),
    decorConcept: z.string(),
    cateringHighlights: z.array(z.string()),
    entertainmentIdeas: z.array(z.string()),
  }),
});

export const aiBudgetOptimizationSchema = z.object({
  currentTotal: z.number(),
  targetBudget: z.number(),
  proposedChanges: z.array(
    z.object({
      category: z.string(),
      currentAllocation: z.number(),
      proposedAllocation: z.number(),
      difference: z.number(),
      rationale: z.string(),
      riskLevel: z.enum(['low', 'medium', 'high']),
    })
  ),
  summaryAdvice: z.string(),
});

export const aiGeneratedTasksSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      relativeDeadline: z.string(),
      description: z.string(),
    })
  ),
});

export const aiGeneratedConceptsSchema = z.object({
  themeTitle: z.string(),
  description: z.string(),
  colorPalette: z.array(
    z.object({
      name: z.string(),
      hex: z.string(),
    })
  ),
  decorIdeas: z.array(z.string()),
  stageLightingConcept: z.string(),
  attireSuggestions: z.string(),
  musicAtmosphere: z.string(),
});

export const aiGeneratedInvitationSchema = z.object({
  headline: z.string(),
  hostIntro: z.string(),
  eventBody: z.string(),
  dateAndVenue: z.string(),
  dressCodeNote: z.string(),
  rsvpClosing: z.string(),
  shortSmsVersion: z.string(),
});

