export type GuestCategory =
  | 'family'
  | 'close_friends'
  | 'friends'
  | 'colleagues'
  | 'vip'
  | 'other';

export type RsvpStatus =
  | 'attending'
  | 'declined'
  | 'tentative'
  | 'pending'
  | 'not_sent';

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: GuestCategory;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryPreferences?: string;
  tableNumber?: string;
  invitationSent: boolean;
  invitationSentDate?: string;
  notes?: string;
  functionsAttending?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GuestSummary {
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
  totalPlusOnes: number;
  dietaryBreakdown: Record<string, number>;
}

