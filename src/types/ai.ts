import { EventCategory } from './event';
import { TaskPriority } from './task';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestions?: string[];
  actionType?: 'create_event' | 'adjust_budget' | 'add_tasks' | 'add_vendors' | 'generate_concept';
  actionPayload?: Record<string, unknown>;
}

export interface AiConversation {
  id: string;
  eventId?: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AiGeneratedEventPlan {
  eventOverview: {
    name: string;
    category: EventCategory;
    guestCount: number;
    estimatedBudget: number;
    currency: string;
    description: string;
    theme: string;
    suggestedDurationDays: number;
  };
  functions: Array<{
    name: string;
    relativeDay: number;
    description: string;
    suggestedTiming: string;
  }>;
  budgetAllocations: Array<{
    category: string;
    allocatedAmount: number;
    percentage: number;
    reason: string;
  }>;
  tasks: Array<{
    title: string;
    category: string;
    priority: TaskPriority;
    relativeDeadline: string;
    description: string;
  }>;
  recommendedVendors: Array<{
    category: string;
    estimatedCost: number;
    importance: 'essential' | 'high' | 'medium' | 'nice_to_have';
    selectionTips: string;
  }>;
  creativeIdeas: {
    themeTitle: string;
    colorPalette: Array<{ name: string; hex: string }>;
    decorConcept: string;
    cateringHighlights: string[];
    entertainmentIdeas: string[];
  };
}

export interface AiBudgetOptimizationProposal {
  currentTotal: number;
  targetBudget: number;
  proposedChanges: Array<{
    category: string;
    currentAllocation: number;
    proposedAllocation: number;
    difference: number;
    rationale: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  summaryAdvice: string;
}

export interface AiGeneratedInvitation {
  headline: string;
  hostIntro: string;
  eventBody: string;
  dateAndVenue: string;
  dressCodeNote: string;
  rsvpClosing: string;
  shortSmsVersion: string;
}

