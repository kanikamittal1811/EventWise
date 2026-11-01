import { z } from 'zod';

export const vendorSchema = z.object({
  name: z.string().min(2, 'Vendor name is required'),
  category: z.enum([
    'venue',
    'catering',
    'photography',
    'videography',
    'decoration',
    'entertainment',
    'music_dj',
    'transportation',
    'makeup_hair',
    'attire',
    'invitations',
    'other',
  ]),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  website: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val),
      'Website must start with http:// or https://'
    )
    .or(z.literal(''))
    .optional(),
  address: z.string().optional(),
  quotation: z.coerce.number().min(0, 'Quotation must be positive'),
  negotiatedPrice: z.coerce.number().min(0, 'Negotiated price must be positive'),
  bookingStatus: z.enum([
    'inquired',
    'shortlisted',
    'contacted',
    'negotiating',
    'booked',
    'declined',
  ]),
  paymentStatus: z.enum(['unpaid', 'deposit_paid', 'fully_paid']),
  notes: z.string().max(1000).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

