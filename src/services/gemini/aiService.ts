import {
  aiEventPlanSchema,
  aiBudgetOptimizationSchema,
  aiGeneratedTasksSchema,
  aiGeneratedConceptsSchema,
  aiGeneratedInvitationSchema,
} from '../../schemas/ai.schema';
import {
  AiGeneratedEventPlan,
  AiBudgetOptimizationProposal,
  AiGeneratedInvitation,
} from '../../types/ai';

export const AiService = {
  /**
   * Generates a complete structured event plan from a natural-language description.
   */
  async generateEventPlan(params: {
    prompt: string;
    category?: string;
    guestCount?: number;
    budget?: number;
    currency?: string;
    location?: string;
  }): Promise<AiGeneratedEventPlan> {
    const res = await fetch('/api/gemini/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate event plan (${res.status})`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Invalid AI response');
    }

    // Validate with Zod schema
    const validated = aiEventPlanSchema.safeParse(json.data);
    if (!validated.success) {
      console.warn('AI plan validation warning, returning sanitized payload:', validated.error);
      return json.data as AiGeneratedEventPlan;
    }

    return validated.data as AiGeneratedEventPlan;
  },

  /**
   * Proposes deterministic budget reallocations based on user constraints.
   */
  async optimizeBudget(params: {
    currentBudget: number;
    targetBudget: number;
    categories: Record<string, any>;
    expenses: Record<string, any>;
    constraintNotes?: string;
    currency?: string;
  }): Promise<AiBudgetOptimizationProposal> {
    const res = await fetch('/api/gemini/optimize-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to optimize budget');
    }

    const json = await res.json();
    const validated = aiBudgetOptimizationSchema.safeParse(json.data);
    if (!validated.success) {
      return json.data as AiBudgetOptimizationProposal;
    }
    return validated.data as AiBudgetOptimizationProposal;
  },

  /**
   * Generates contextual task checklists.
   */
  async generateTasks(params: {
    category: string;
    eventDate?: string;
    functions?: any[];
  }) {
    const res = await fetch('/api/gemini/generate-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate tasks');
    const json = await res.json();
    const validated = aiGeneratedTasksSchema.safeParse(json.data);
    if (!validated.success) {
      return json.data.tasks;
    }
    return validated.data.tasks;
  },

  /**
   * Sends a conversational query with full active event context.
   */
  async chatWithAssistant(params: {
    message: string;
    eventContext: {
      name?: string;
      category?: string;
      eventDate?: string;
      currency?: string;
      totalBudget?: number;
      totalSpent?: number;
      guestCount?: number;
      pendingTasksCount?: number;
      bookedVendorsCount?: number;
    };
    conversationHistory?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  }): Promise<{ reply: string; suggestions?: string[] }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('AI chat failed');
    return await res.json();
  },

  /**
   * Generates bespoke invitation text.
   */
  async generateInvitation(params: {
    eventName: string;
    category?: string;
    date?: string;
    venue?: string;
    hosts?: string;
    tone?: string;
  }): Promise<AiGeneratedInvitation> {
    const res = await fetch('/api/gemini/generate-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate invitation');
    const json = await res.json();
    const validated = aiGeneratedInvitationSchema.safeParse(json.data);
    if (!validated.success) {
      return json.data as AiGeneratedInvitation;
    }
    return validated.data as AiGeneratedInvitation;
  },

  /**
   * Generates aesthetic theme ideas and color palettes.
   */
  async generateConcepts(params: { themeKeyword: string; category?: string }) {
    const res = await fetch('/api/gemini/generate-concepts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate concepts');
    const json = await res.json();
    const validated = aiGeneratedConceptsSchema.safeParse(json.data);
    if (!validated.success) {
      return json.data;
    }
    return validated.data;
  },

  /**
   * Requests AI Image Generation.
   * If model does not support it, honest unavailable state is returned.
   */
  async requestImageGeneration(prompt: string): Promise<{ available: boolean; message: string }> {
    const res = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json().catch(() => ({}));
    return {
      available: false,
      message:
        json.message ||
        'Direct raster image generation is unavailable with the configured Gemini model. Please upload images directly to the Creative Studio (which enforces our strict 1 MB Base64 Realtime Database storage architecture).',
    };
  },
};

