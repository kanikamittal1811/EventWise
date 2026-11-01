import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(100),
  category: z.enum([
    'wedding',
    'birthday',
    'engagement',
    'anniversary',
    'baby_shower',
    'corporate',
    'community',
    'festival',
    'custom'
  ]),
  description: z.string().max(1000).optional(),
  location: z.string().min(2, 'Location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  endDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(1, 'Guest count must be at least 1').max(100000),
  totalBudget: z.coerce.number().min(0, 'Budget must be non-negative'),
  currency: z.string().min(1).default('INR'),
  theme: z.string().max(100).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const eventFunctionSchema = z.object({
  name: z.string().min(2, 'Function name required'),
  date: z.string().min(1, 'Date required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  dressCode: z.string().optional(),
});

export type EventFunctionFormData = z.infer<typeof eventFunctionSchema>;

