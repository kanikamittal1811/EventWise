import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { VENDOR_CATALOG, CatalogVendor } from './vendorCatalog';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Strict Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:* https://*.firebaseio.com;"
  );
  next();
});

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server or local scripts) or in allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// 3. Strict Request Body Size Limiting (Prevents Memory Exhaustion / DoS)
app.use(express.json({ limit: '256kb' }));

// 4. In-Memory Sliding Window Rate Limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function createRateLimiter(windowMs: number, maxRequests: number, endpointName = 'Endpoint') {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${endpointName}:${rawIp}`;
    const now = Date.now();
    const current = rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded for ${endpointName}. Please wait ${retryAfter} seconds before retrying.`,
      });
    }

    current.count++;
    next();
  };
}

// Global limiter: 100 requests per 15 minutes per IP
app.use(createRateLimiter(15 * 60 * 1000, 100, 'GlobalAPI'));

// Strict limiter for heavy AI generation endpoints: 20 requests per 10 minutes
const aiLimiter = createRateLimiter(10 * 60 * 1000, 20, 'AiOperations');

// 5. Server-Side Zod Validation Schemas
const generatePlanRequestSchema = z.object({
  prompt: z.string().min(2).max(1000),
  category: z
    .enum([
      'wedding',
      'birthday',
      'engagement',
      'anniversary',
      'baby_shower',
      'corporate',
      'community',
      'festival',
      'custom',
    ])
    .default('wedding'),
  guestCount: z.coerce.number().int().min(1).max(50000).default(150),
  budget: z.coerce.number().min(0).max(10000000000).default(1500000),
  currency: z.string().min(1).max(10).default('INR'),
  location: z.string().max(200).optional().default('Jaipur'),
});

const optimizeBudgetRequestSchema = z.object({
  currentBudget: z.coerce.number().min(0).max(10000000000),
  targetBudget: z.coerce.number().min(0).max(10000000000),
  categories: z.record(z.any()).default({}),
  expenses: z.record(z.any()).default({}),
  constraintNotes: z.string().max(1000).optional().default(''),
  currency: z.string().max(10).default('INR'),
});

const generateTasksRequestSchema = z.object({
  category: z.string().min(1).max(100).default('wedding'),
  eventDate: z.string().max(50).optional(),
  functions: z.array(z.any()).optional().default([]),
});

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  eventContext: z
    .object({
      name: z.string().max(200).optional(),
      category: z.string().max(100).optional(),
      eventDate: z.string().max(50).optional(),
      currency: z.string().max(10).optional(),
      totalBudget: z.coerce.number().optional(),
      totalSpent: z.coerce.number().optional(),
      guestCount: z.coerce.number().optional(),
      pendingTasksCount: z.coerce.number().optional(),
      bookedVendorsCount: z.coerce.number().optional(),
    })
    .optional(),
  conversationHistory: z
    .array(
      z.object({
        sender: z.enum(['user', 'assistant']),
        text: z.string().max(2000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

const generateInvitationRequestSchema = z.object({
  eventName: z.string().min(1).max(200),
  category: z.string().max(100).optional().default('celebration'),
  date: z.string().max(100).optional().default(''),
  venue: z.string().max(200).optional().default(''),
  hosts: z.string().max(100).optional().default('The Family'),
  tone: z.string().max(100).optional().default('warm and elegant'),
});

const generateConceptsRequestSchema = z.object({
  themeKeyword: z.string().min(1).max(200).default('Modern Botanical'),
  category: z.string().max(100).optional().default('event'),
});

// Gemini Engine Initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

function cleanAndParseJson<T = any>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log(`[EventWise Server] Gemini AI initialized with model: ${modelName}`);
} else {
  console.warn(
    '[EventWise Server] GEMINI_API_KEY not found in environment. Server will serve structured template plans & intelligent simulated responses.'
  );
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(apiKey),
    model: modelName,
    timestamp: Date.now(),
  });
});

/**
 * 1. Generate full event plan from natural language prompt
 */
app.post('/api/gemini/generate-plan', aiLimiter, async (req: Request, res: Response) => {
  try {
    // Server-side Zod validation
    const parsedInput = generatePlanRequestSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload: ' + parsedInput.error.issues[0]?.message,
      });
    }

    const { prompt, category, guestCount, budget, currency, location } = parsedInput.data;

    // Static system instructions (Prevents prompt injection by never interpolating user input into system instructions)
    const systemPrompt = `You are EventWise, an expert AI Event Planner & Solutions Architect.
Generate a comprehensive, structured JSON event plan based on the user's prompt.
If the user's request description specifies a particular category, location, guest count, or budget, give priority to the details in the user's description over any default parameters.
Strictly return ONLY a valid JSON object with no markdown formatting, fences, or backticks.
The JSON must adhere to this exact schema:
{
  "eventOverview": {
    "name": string,
    "category": string,
    "guestCount": number,
    "estimatedBudget": number,
    "currency": string,
    "description": string,
    "theme": string,
    "suggestedDurationDays": number
  },
  "functions": [
    {
      "name": string,
      "relativeDay": number,
      "description": string,
      "suggestedTiming": string
    }
  ],
  "budgetAllocations": [
    {
      "category": string,
      "allocatedAmount": number,
      "percentage": number,
      "reason": string
    }
  ],
  "tasks": [
    {
      "title": string,
      "category": string,
      "priority": "low" | "medium" | "high" | "urgent",
      "relativeDeadline": string,
      "description": string
    }
  ],
  "recommendedVendors": [
    {
      "category": string,
      "estimatedCost": number,
      "importance": "essential" | "high" | "medium" | "nice_to_have",
      "selectionTips": string
    }
  ],
  "creativeIdeas": {
    "themeTitle": string,
    "colorPalette": [
      { "name": string, "hex": string }
    ],
    "decorConcept": string,
    "cateringHighlights": [string],
    "entertainmentIdeas": [string]
  }
}
All budgetAllocations percentages must sum to 100%, and allocatedAmount must sum to estimatedBudget.`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        // Delimit user input cleanly
        const userPrompt = [
          `[USER PLANNING SPECIFICATION]`,
          `Category: ${category}`,
          `Location: ${location}`,
          `Guest Count: ${guestCount}`,
          `Total Budget: ${currency} ${budget}`,
          `User Request Description: "${prompt.replace(/["\\]/g, ' ')}"`,
        ].join('\n');

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const text = result.response.text();
        const parsed = cleanAndParseJson(text);
        return res.json({ success: true, data: parsed });
      } catch (geminiError: any) {
        console.error('[Gemini API plan generation error]', geminiError.message || geminiError);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${geminiError.message || 'Failed to generate plan'}`,
        });
      }
    }

    // Deterministic fallback plan
    const safeBudget = budget;
    const safeGuests = guestCount;
    const safeCurrency = currency;
    const safeCategory = category;

    const fallbackPlan = {
      eventOverview: {
        name: prompt ? prompt.slice(0, 50) : `Grand ${safeCategory.toUpperCase()} Celebration`,
        category: safeCategory,
        guestCount: safeGuests,
        estimatedBudget: safeBudget,
        currency: safeCurrency,
        description: `Custom curated ${safeCategory} tailored for ${safeGuests} guests in ${location}. Designed for seamless hospitality, vibrant aesthetics, and stress-free coordination.`,
        theme: 'Royal Elegance & Warm Contemporary Botanicals',
        suggestedDurationDays: safeCategory === 'wedding' ? 3 : 1,
      },
      functions:
        safeCategory === 'wedding'
          ? [
              {
                name: 'Mehendi & Sangeet Evening',
                relativeDay: 1,
                description: 'Vibrant musical kickoff with folk dance and henna artists',
                suggestedTiming: '5:00 PM - 11:00 PM',
              },
              {
                name: 'Traditional Haldi & Poolside Brunch',
                relativeDay: 2,
                description: 'Sunlit yellow florals, organic marigold petals, and brass band',
                suggestedTiming: '10:30 AM - 2:30 PM',
              },
              {
                name: 'Vows & Grand Reception Banquet',
                relativeDay: 3,
                description: 'Formal twilight ceremony followed by multi-cuisine gala banquet',
                suggestedTiming: '6:30 PM - Late',
              },
            ]
          : [
              {
                name: 'Main Celebration Banquet',
                relativeDay: 1,
                description: 'Welcome drinks, celebration speeches, and gourmet dinner',
                suggestedTiming: '7:00 PM - 11:30 PM',
              },
            ],
      budgetAllocations: [
        {
          category: 'Venue & Banquets',
          allocatedAmount: Math.round(safeBudget * 0.35),
          percentage: 35,
          reason: 'High-capacity indoor banquet plus landscaped lawn',
        },
        {
          category: 'Catering & Beverages',
          allocatedAmount: Math.round(safeBudget * 0.25),
          percentage: 25,
          reason: `Curated multi-cuisine live stations for ${safeGuests} guests`,
        },
        {
          category: 'Photography & Cinematography',
          allocatedAmount: Math.round(safeBudget * 0.12),
          percentage: 12,
          reason: 'Drone coverage, traditional portraits, and cinematic teaser film',
        },
        {
          category: 'Floral & Decor',
          allocatedAmount: Math.round(safeBudget * 0.12),
          percentage: 12,
          reason: 'Floral stage backdrop, mood ambient uplighting, and entrance walkway',
        },
        {
          category: 'Entertainment & Sound',
          allocatedAmount: Math.round(safeBudget * 0.08),
          percentage: 8,
          reason: 'Sound engineering, curated DJ playlist, and anchor emcee',
        },
        {
          category: 'Stationery & Favors',
          allocatedAmount: Math.round(safeBudget * 0.05),
          percentage: 5,
          reason: 'Digital cards, physical welcome boxes, and personalized gifts',
        },
        {
          category: 'Contingency Reserve',
          allocatedAmount: Math.round(safeBudget * 0.03),
          percentage: 3,
          reason: 'Buffer for last-minute headcount or logistic changes',
        },
      ],
      tasks: [
        {
          title: 'Confirm and lock venue contract with initial deposit',
          category: 'Venue',
          priority: 'urgent',
          relativeDeadline: '4 months before',
          description: 'Review cancellation clauses, curfews, and power backup',
        },
        {
          title: 'Finalize multi-cuisine menu tasting with caterer',
          category: 'Catering',
          priority: 'high',
          relativeDeadline: '3 months before',
          description: 'Include dietary options for vegetarian and vegan guests',
        },
        {
          title: 'Book lead photographer & cinematography crew',
          category: 'Photography',
          priority: 'high',
          relativeDeadline: '3 months before',
          description: 'Share moodboard references and shoot schedule',
        },
        {
          title: 'Send digital save-the-dates and collect initial RSVPs',
          category: 'Invitations',
          priority: 'medium',
          relativeDeadline: '2 months before',
          description: 'Use EventWise invitation generator',
        },
        {
          title: 'Finalize stage backdrop and floral ceiling installations',
          category: 'Decor',
          priority: 'medium',
          relativeDeadline: '1 month before',
          description: 'Approve 3D mockups and flower palettes',
        },
        {
          title: 'Final RSVP headcount confirmation to venue & catering',
          category: 'Guests',
          priority: 'urgent',
          relativeDeadline: '10 days before',
          description: 'Lock in final plate count to avoid overage fees',
        },
      ],
      recommendedVendors: [
        {
          category: 'Venue',
          estimatedCost: Math.round(safeBudget * 0.35),
          importance: 'essential',
          selectionTips: 'Ensure separate valet parking and backup diesel generator capacity.',
        },
        {
          category: 'Catering',
          estimatedCost: Math.round(safeBudget * 0.25),
          importance: 'essential',
          selectionTips: 'Request live chaat and artisanal mocktail bars.',
        },
        {
          category: 'Photography',
          estimatedCost: Math.round(safeBudget * 0.12),
          importance: 'high',
          selectionTips: 'Check prior portfolio at same or similar lighting conditions.',
        },
        {
          category: 'Floral & Decor',
          estimatedCost: Math.round(safeBudget * 0.12),
          importance: 'high',
          selectionTips: 'Ask for locally sourced seasonal blooms to optimize budget.',
        },
        {
          category: 'Entertainment',
          estimatedCost: Math.round(safeBudget * 0.08),
          importance: 'medium',
          selectionTips: 'Confirm sound licenses (PPL/IPRS) beforehand.',
        },
      ],
      creativeIdeas: {
        themeTitle: 'Warm Ivory & Heritage Rose Gold',
        colorPalette: [
          { name: 'Warm Ivory', hex: '#FAF7F2' },
          { name: 'Dusty Rose', hex: '#DCAE96' },
          { name: 'Deep Indigo', hex: '#2D3250' },
          { name: 'Royal Gold', hex: '#D4AF37' },
          { name: 'Sage Green', hex: '#9CAF88' },
        ],
        decorConcept:
          'Suspended brass fairy lanterns with cascading eucalyptus vines and micro-fairy lit sheer drapes creating an intimate, magical starlight canopy.',
        cateringHighlights: [
          'Artisanal grazing tables with truffle dips and local cheeses',
          'Interactive wood-fired pizza and taco live bars',
          'Traditional slow-cooked regional desserts with pistachio crumbles',
        ],
        entertainmentIdeas: [
          'Acoustic string quartet during guest arrival and cocktails',
          'Interactive Polaroid guestbook station with metallic pens',
          'High-energy percussionist jamming alongside the DJ set',
        ],
      },
    };

    return res.json({ success: true, data: fallbackPlan });
  } catch (error: any) {
    console.error('[Error in generate-plan]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while generating the plan. Please try again.',
    });
  }
});

/**
 * 2. Optimize budget given constraints
 */
app.post('/api/gemini/optimize-budget', aiLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = optimizeBudgetRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ' + parsed.error.issues[0]?.message,
      });
    }

    const { currentBudget, targetBudget, categories, expenses, constraintNotes, currency } =
      parsed.data;

    const systemPrompt = `You are an expert event financial planner.
Analyze the provided budget categories, actual spend, and target budget. Propose deterministic reallocations to meet the target.
Strictly return ONLY JSON in this format:
{
  "currentTotal": number,
  "targetBudget": number,
  "proposedChanges": [
    {
      "category": string,
      "currentAllocation": number,
      "proposedAllocation": number,
      "difference": number,
      "rationale": string,
      "riskLevel": "low" | "medium" | "high"
    }
  ],
  "summaryAdvice": string
}`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = [
          `Current Budget: ${currentBudget} ${currency}`,
          `Target Budget: ${targetBudget} ${currency}`,
          `Categories: ${JSON.stringify(categories).slice(0, 3000)}`,
          `Actual Expenses: ${JSON.stringify(expenses).slice(0, 3000)}`,
          `User Constraints: "${constraintNotes.replace(/["\\]/g, ' ')}"`,
        ].join('\n');

        const result = await model.generateContent([systemPrompt, prompt]);
        const data = cleanAndParseJson(result.response.text());
        return res.json({ success: true, data });
      } catch (geminiError: any) {
        console.error('[Gemini optimization error]', geminiError.message || geminiError);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${geminiError.message || 'Failed to optimize budget'}`,
        });
      }
    }

    // Deterministic fallback
    const diffTotal = currentBudget - targetBudget;
    const catList = Object.values(categories || {}) as any[];
    const proposedChanges = catList.map((cat: any) => {
      const current = Number(cat.allocatedAmount) || 0;
      const isProtected = /cater|photo/i.test(cat.name || '');
      const reductionRatio = isProtected ? 0.05 : 0.15;
      const proposed = Math.max(0, Math.round(current * (1 - reductionRatio)));
      return {
        category: cat.name || 'Category',
        currentAllocation: current,
        proposedAllocation: proposed,
        difference: proposed - current,
        rationale: isProtected
          ? 'Preserved essential quality with mild renegotiation on extras.'
          : 'Optimized by trimming custom floral installations and opting for seasonal alternatives.',
        riskLevel: isProtected ? 'low' : 'medium',
      };
    });

    return res.json({
      success: true,
      data: {
        currentTotal: currentBudget,
        targetBudget,
        proposedChanges,
        summaryAdvice: `Successfully identified savings of ${currency} ${Math.abs(diffTotal).toLocaleString()} primarily across decorative staging and entertainment without compromising core catering or memory-making photography.`,
      },
    });
  } catch (error: any) {
    console.error('[Error in optimize-budget]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while optimizing the budget.',
    });
  }
});

/**
 * 3. Generate Task checklist for event
 */
app.post('/api/gemini/generate-tasks', aiLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = generateTasksRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ' + parsed.error.issues[0]?.message,
      });
    }

    const { category, eventDate } = parsed.data;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate an 8-12 item comprehensive milestone task checklist for a ${category.replace(/[^a-zA-Z0-9 ]/g, '')} taking place on ${eventDate || 'in 6 months'}.
Format strictly as JSON:
{
  "tasks": [
    {
      "title": string,
      "category": string,
      "priority": "low" | "medium" | "high" | "urgent",
      "relativeDeadline": string,
      "description": string
    }
  ]
}`;
        const result = await model.generateContent(prompt);
        return res.json({ success: true, data: cleanAndParseJson(result.response.text()) });
      } catch (e: any) {
        console.error('[Tasks generation error]', e.message || e);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${e.message || 'Failed to generate tasks'}`,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        tasks: [
          {
            title: 'Lock in primary venue reservation',
            category: 'Venue',
            priority: 'urgent',
            relativeDeadline: '5 months before',
            description: 'Pay advance and verify noise restrictions',
          },
          {
            title: 'Catering menu curation and tasting session',
            category: 'Catering',
            priority: 'high',
            relativeDeadline: '4 months before',
            description: 'Select signature beverages and dessert spread',
          },
          {
            title: 'Hire photographer and videographer',
            category: 'Photography',
            priority: 'high',
            relativeDeadline: '3 months before',
            description: 'Verify portfolio and schedule engagement portraits',
          },
          {
            title: 'Finalize floral decor concept and theme colors',
            category: 'Decor',
            priority: 'medium',
            relativeDeadline: '2 months before',
            description: 'Review sample centerpieces with florist',
          },
          {
            title: 'Distribute digital invitations and track RSVPs',
            category: 'Guests',
            priority: 'high',
            relativeDeadline: '6 weeks before',
            description: 'Collect dietary restrictions',
          },
          {
            title: 'Confirm transport and accommodation for out-of-town guests',
            category: 'Logistics',
            priority: 'medium',
            relativeDeadline: '3 weeks before',
            description: 'Schedule airport pickups',
          },
          {
            title: 'Run-through event day timeline with family & coordinators',
            category: 'Coordination',
            priority: 'urgent',
            relativeDeadline: '1 week before',
            description: 'Coordinate emcee announcements and vendor arrival slots',
          },
          {
            title: 'Final vendor balance payments & gratuity envelopes',
            category: 'Finance',
            priority: 'high',
            relativeDeadline: '2 days before',
            description: 'Organize receipts and cash/wire envelopes',
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('[Error in generate-tasks]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while generating tasks.',
    });
  }
});

/**
 * 4. Context-Aware Assistant Chat
 */
app.post('/api/gemini/chat', aiLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ' + parsed.error.issues[0]?.message,
      });
    }

    const { message, eventContext, conversationHistory } = parsed.data;

    const systemPrompt = `You are the EventWise AI Assistant, an ultra-competent, warm, and sophisticated event planner.
Guidelines:
- Answer the user's questions clearly, concisely, and insightfully.
- Keep calculations deterministic and refer to the specific numbers from their event context.
- Provide 2-3 clickable suggested next prompts at the bottom.`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const historyText = (conversationHistory || [])
          .slice(-6)
          .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text.replace(/[\r\n]+/g, ' ')}`)
          .join('\n');

        const prompt = [
          systemPrompt,
          `Event Context: ${JSON.stringify(eventContext || {})}`,
          `Recent Conversation:\n${historyText}`,
          `User Query: ${message.replace(/["\\]/g, ' ')}`,
        ].join('\n\n');

        const result = await model.generateContent(prompt);
        const replyText = result.response.text();

        return res.json({
          success: true,
          reply: replyText,
          suggestions: [
            'How can I trim catering costs without losing variety?',
            'What timeline should I follow on the wedding morning?',
            'Draft a polite RSVP reminder message for WhatsApp',
          ],
        });
      } catch (e: any) {
        console.error('[Chat AI error]', e.message || e);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${e.message || 'Failed to generate chat reply'}`,
        });
      }
    }

    // Contextual fallback reply
    const eventName = eventContext?.name || 'your event';
    const currency = eventContext?.currency || 'INR';
    const totalBudget = Number(eventContext?.totalBudget) || 0;
    const spent = Number(eventContext?.totalSpent) || 0;
    const remaining = totalBudget - spent;

    let response = `I'm analyzing **${eventName}** for you! `;
    if (/budget|cost|spend|money|expense/i.test(message)) {
      response += `Your total budget is **${currency} ${totalBudget.toLocaleString()}**, with **${currency} ${spent.toLocaleString()}** spent and **${currency} ${remaining.toLocaleString()}** remaining. To optimize costs, consider bundling photography with cinematography or switching to local seasonal flowers for stage backdrops.`;
    } else if (/guest|rsvp|invite/i.test(message)) {
      response += `You are currently planning for **${eventContext?.guestCount || 150} guests**. I recommend sending out reminders 3 weeks prior to lock in the catering headcount.`;
    } else if (/task|timeline|to-do/i.test(message)) {
      response += `You have **${eventContext?.pendingTasksCount || 5} pending tasks**. Focusing on locking down vendors with contracts should be your top priority this week.`;
    } else {
      response += `Here is how we can move forward: we can explore creative themes, refine your budget allocations, or draft custom invitations tailored to your theme.`;
    }

    return res.json({
      success: true,
      reply: response,
      suggestions: [
        'Review my remaining budget and give tips',
        'Suggest 3 unique welcome drinks for the reception',
        'Generate a checklist for the final week',
      ],
    });
  } catch (error: any) {
    console.error('[Error in chat]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during chat processing.',
    });
  }
});

/**
 * 5. Generate Invitation Copy
 */
app.post('/api/gemini/generate-invitation', aiLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = generateInvitationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ' + parsed.error.issues[0]?.message,
      });
    }

    const { eventName, category, date, venue, hosts, tone } = parsed.data;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Draft a ${tone} invitation for a ${category}:
Event: ${eventName.replace(/["\\]/g, ' ')}
Date: ${date}
Venue: ${venue.replace(/["\\]/g, ' ')}
Hosts: ${hosts.replace(/["\\]/g, ' ')}
Format strictly as JSON:
{
  "headline": string,
  "hostIntro": string,
  "eventBody": string,
  "dateAndVenue": string,
  "dressCodeNote": string,
  "rsvpClosing": string,
  "shortSmsVersion": string
}`;
        const result = await model.generateContent(prompt);
        return res.json({ success: true, data: cleanAndParseJson(result.response.text()) });
      } catch (e: any) {
        console.error('[Invitation generator error]', e.message || e);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${e.message || 'Failed to generate invitation'}`,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        headline: `Celebration of Love & Togetherness`,
        hostIntro: `${hosts} cordially invite you to celebrate`,
        eventBody: `Join us as we raise a toast to joy, laughter, and unforgettable memories at the ${eventName}.`,
        dateAndVenue: `${date || 'Sunday, November 15, 2026'} at ${venue || 'The Grand Royal Palace & Gardens'}`,
        dressCodeNote: 'Dress Code: Festive Traditional or Elegant Formal',
        rsvpClosing:
          'Please grace us with your presence and blessings. Kindly RSVP by replying to this message.',
        shortSmsVersion: `You're invited to ${eventName}! Join us on ${date || 'the big day'} at ${venue || 'our venue'}. Please RSVP!`,
      },
    });
  } catch (error: any) {
    console.error('[Error in generate-invitation]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while generating invitation.',
    });
  }
});

/**
 * 6. Generate Creative Visual Concepts & Color Palettes
 */
app.post('/api/gemini/generate-concepts', aiLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = generateConceptsRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ' + parsed.error.issues[0]?.message,
      });
    }

    const { themeKeyword, category } = parsed.data;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate an inspiring aesthetic concept for ${themeKeyword.replace(/["\\]/g, ' ')} for a ${category}.
Format strictly as JSON:
{
  "themeTitle": string,
  "description": string,
  "colorPalette": [
    { "name": string, "hex": string }
  ],
  "decorIdeas": [string],
  "stageLightingConcept": string,
  "attireSuggestions": string,
  "musicAtmosphere": string
}`;
        const result = await model.generateContent(prompt);
        return res.json({ success: true, data: cleanAndParseJson(result.response.text()) });
      } catch (e: any) {
        console.error('[Concept generator error]', e.message || e);
        return res.status(502).json({
          success: false,
          error: `Gemini AI Error: ${e.message || 'Failed to generate concepts'}`,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        themeTitle: `${themeKeyword}`,
        description:
          'An earthy yet opulent fusion of terracotta warmth, brushed champagne gold accents, and lush pampas grass arrangements.',
        colorPalette: [
          { name: 'Terracotta', hex: '#C86D51' },
          { name: 'Warm Sand', hex: '#E6D7C3' },
          { name: 'Champagne Gold', hex: '#D4AF37' },
          { name: 'Forest Moss', hex: '#4A5B43' },
          { name: 'Ivory Cream', hex: '#FDFBF7' },
        ],
        decorIdeas: [
          'Archway framed with dried palm spears, white hydrangeas, and trailing jasmine',
          'Rattan pendant lights suspended over low wooden lounge seating with velvet cushions',
          'Personalized wax-sealed calligraphy place cards on handmade cotton deckle-edge paper',
        ],
        stageLightingConcept:
          'Soft amber pinspots on floral clusters with warm fairy-light canopy cascading overhead',
        attireSuggestions:
          'Semi-formal pastels, linen blazers, and breezy organza or silk draped ensembles',
        musicAtmosphere:
          'Chilled lounge bossa nova transitioning to dynamic acoustic melodic beats',
      },
    });
  } catch (error: any) {
    console.error('[Error in generate-concepts]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while generating concepts.',
    });
  }
});

/**
 * 7. AI Image generation endpoint
 */
app.post('/api/gemini/generate-image', aiLimiter, async (_req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    available: false,
    message:
      'Direct raster AI image generation is not supported by the currently configured Gemini Flash/Pro text model. You can upload any reference image into the Creative Studio (which enforces our strict 1 MB Base64 Realtime Database pipeline), or generate rich visual design concepts and color palettes.',
  });
});

/**
 * 8. Vendor Marketplace Catalog Endpoint
 */
app.get('/api/vendors/catalog', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const budgetTier = req.query.budgetTier as string | undefined;
  const city = req.query.city as string | undefined;
  const minBudget = req.query.minBudget ? Number(req.query.minBudget) : undefined;
  const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : undefined;
  const search = req.query.search as string | undefined;

  let filtered = [...VENDOR_CATALOG];

  if (category && category !== 'all') {
    filtered = filtered.filter((v) => v.category === category);
  }
  if (budgetTier && budgetTier !== 'all') {
    filtered = filtered.filter((v) => v.budgetTier === budgetTier);
  }
  if (city && city !== 'all') {
    filtered = filtered.filter((v) => v.city.toLowerCase() === city.toLowerCase());
  }
  if (minBudget !== undefined && !isNaN(minBudget)) {
    filtered = filtered.filter((v) => v.quotation >= minBudget);
  }
  if (maxBudget !== undefined && !isNaN(maxBudget)) {
    filtered = filtered.filter((v) => v.quotation <= maxBudget);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sort by rating descending by default
  filtered.sort((a, b) => b.rating - a.rating);

  return res.json({
    success: true,
    total: filtered.length,
    data: filtered,
  });
});

app.listen(PORT, () => {
  console.log(`[EventWise] Hardened server running on http://localhost:${PORT}`);
});
