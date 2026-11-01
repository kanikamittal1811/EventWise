import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from '../src/services/gemini/aiService';

describe('AiService Unit Tests', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('generateEventPlan successfully fetches and parses structured event plan', async () => {
    const mockPlanData = {
      eventOverview: {
        name: 'Royal Heritage Wedding',
        category: 'wedding',
        theme: 'Mughal Elegance',
        guestCount: 200,
        estimatedBudget: 2500000,
        currency: 'INR',
        description: 'Spectacular royal palace wedding',
      },
      budgetAllocations: [
        { category: 'Venue & Stay', percentage: 40, allocatedAmount: 1000000, color: '#3B82F6', reason: 'Palace rental' },
        { category: 'Food & Beverage', percentage: 30, allocatedAmount: 750000, color: '#F59E0B', reason: 'Royal catering' },
      ],
      tasks: [
        {
          title: 'Book Royal Palace Courtyard',
          category: 'Venue',
          priority: 'urgent' as const,
          relativeDeadline: '6 months prior',
          description: 'Reserve main lawn and banquet hall',
        },
      ],
      recommendedVendors: [
        {
          category: 'Venue',
          estimatedCost: 1000000,
          importance: 'essential' as const,
          selectionTips: 'Verify curfew and sound rules',
        },
      ],
      creativeIdeas: {
        themeTitle: 'Mughal Splendor',
        colorPalette: [
          { name: 'Royal Crimson', hex: '#842A3E' },
          { name: 'Imperial Gold', hex: '#F59E0B' },
        ],
        decorConcept: 'Marigold floral arches with brass lanterns',
        cateringHighlights: ['Live Chaat Counter', 'Royal Mughlai Biryani'],
        entertainmentIdeas: ['Classical Sitar Ensemble', 'Rajasthani Folk Troupe'],
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockPlanData }),
    } as any);

    const result = await AiService.generateEventPlan({ prompt: 'Plan a royal wedding in Jaipur' });

    expect(result.eventOverview.name).toBe('Royal Heritage Wedding');
    expect(result.budgetAllocations.length).toBe(2);
    expect(result.tasks.length).toBe(1);
    expect(fetch).toHaveBeenCalledWith('/api/gemini/generate-plan', expect.any(Object));
  });

  it('generateEventPlan throws error when backend responds with failure status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Gemini quota exceeded or server error' }),
    } as any);

    await expect(
      AiService.generateEventPlan({ prompt: 'Invalid prompt trigger' })
    ).rejects.toThrow('Gemini quota exceeded or server error');
  });

  it('optimizeBudget sends constraints and returns allocation proposal', async () => {
    const mockProposal = {
      strategy: 'Trim catering costs and negotiate lighting packages',
      revisedAllocations: [
        { category: 'Catering', currentAmount: 600000, suggestedAmount: 500000, changeReason: 'Opt for seasonal buffet' },
      ],
      estimatedSavings: 100000,
      confidenceScore: 0.9,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockProposal }),
    } as any);

    const result = await AiService.optimizeBudget({
      currentBudget: 1500000,
      targetBudget: 1400000,
      categories: {},
      expenses: {},
      constraintNotes: 'Cannot reduce photography budget',
    });

    expect(result.strategy).toContain('Trim catering');
    expect(result.estimatedSavings).toBe(100000);
  });

  it('generateTasks returns contextual tasks array', async () => {
    const mockTasks = [
      { title: 'Select Wedding Cake Design', category: 'Catering', priority: 'medium', dueDate: '2027-04-01' },
      { title: 'Print Place Cards', category: 'Stationery', priority: 'low', dueDate: '2027-04-10' },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { tasks: mockTasks } }),
    } as any);

    const tasks = await AiService.generateTasks({ category: 'wedding' });
    expect(tasks.length).toBe(2);
    expect(tasks[0].title).toBe('Select Wedding Cake Design');
  });

  it('chatWithAssistant posts message with full live event context', async () => {
    const mockReply = {
      reply: 'Based on your ₹20,00,000 budget and 250 guests, you should allocate ~₹8,000 per plate.',
      suggestions: ['How to shortlist decorators?', 'Can we add a live saxophone player?'],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReply,
    } as any);

    const response = await AiService.chatWithAssistant({
      message: 'What is a good per-plate budget?',
      eventContext: {
        name: 'Roy Gala',
        totalBudget: 2000000,
        guestCount: 250,
      },
    });

    expect(response.reply).toContain('₹20,00,000 budget');
    expect(response.suggestions?.length).toBe(2);
  });

  it('generateInvitation drafts formal letter, short SMS copy, and RSVP info', async () => {
    const mockInvitation = {
      formalInvitationLetter: 'You are cordially invited to celebrate...',
      shortSmsVersion: 'Join us for Roy Gala on Feb 20 at Amritsar! RSVP by Jan 15.',
      rsvpInstructions: 'Please RSVP via EventWise link',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockInvitation }),
    } as any);

    const inv = await AiService.generateInvitation({
      eventName: 'Roy Gala',
      date: '2027-02-20',
      venue: 'Amritsar Grand',
    });

    expect(inv.formalInvitationLetter).toContain('cordially invited');
    expect(inv.shortSmsVersion).toContain('Roy Gala');
  });

  it('requestImageGeneration returns honest architectural guidance when model is unconfigured', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        available: false,
        message: 'Direct raster image generation is unavailable. Please upload images directly to the Creative Studio.',
      }),
    } as any);

    const res = await AiService.requestImageGeneration('Mandap stage with pastel florals');
    expect(res.available).toBe(false);
    expect(res.message).toContain('Creative Studio');
  });
});
