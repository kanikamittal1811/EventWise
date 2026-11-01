export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'videography'
  | 'decoration'
  | 'entertainment'
  | 'music_dj'
  | 'transportation'
  | 'makeup_hair'
  | 'attire'
  | 'invitations'
  | 'other';

export type BookingStatus =
  | 'inquired'
  | 'shortlisted'
  | 'contacted'
  | 'negotiating'
  | 'booked'
  | 'declined';

export type VendorPaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  quotation: number;
  negotiatedPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: VendorPaymentStatus;
  notes?: string;
  imageReferences?: string[];
  contractDocumentId?: string;
  rating?: number;
  createdAt: number;
  updatedAt: number;
}

