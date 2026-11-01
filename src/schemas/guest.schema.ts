import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().min(2, 'Guest name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  category: z.enum(['family', 'close_friends', 'friends', 'colleagues', 'vip', 'other']),
  rsvpStatus: z.enum(['attending', 'declined', 'tentative', 'pending', 'not_sent']),
  plusOnes: z.coerce.number().int().min(0, 'Plus ones cannot be negative').default(0),
  dietaryPreferences: z.string().optional(),
  tableNumber: z.string().optional(),
  invitationSent: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type GuestFormData = z.infer<typeof guestSchema>;

