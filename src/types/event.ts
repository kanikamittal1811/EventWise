import { BudgetCategory, Expense } from './budget';
import { Vendor } from './vendor';
import { Task } from './task';
import { Guest } from './guest';

export type EventCategory =
  | 'wedding'
  | 'birthday'
  | 'engagement'
  | 'anniversary'
  | 'baby_shower'
  | 'corporate'
  | 'community'
  | 'festival'
  | 'custom';

export type EventStatus =
  | 'planning'
  | 'in_progress'
  | 'completed'
  | 'archived';

export interface EventFunction {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  description?: string;
  dressCode?: string;
}

export interface MoodboardItem {
  id: string;
  imageId: string;
  caption?: string;
  tags?: string[];
  createdAt: number;
}

export interface Moodboard {
  id: string;
  title: string;
  themeDescription?: string;
  colorPalette?: string[];
  items?: Record<string, MoodboardItem>;
  createdAt: number;
}

export interface Collaborator {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: number;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'event' | 'budget' | 'expense' | 'vendor' | 'task' | 'guest' | 'moodboard' | 'ai';
  entityName?: string;
  timestamp: number;
}

export interface EventItem {
  id: string;
  ownerId: string;
  name: string;
  category: EventCategory;
  description?: string;
  location: string;
  eventDate: string;
  endDate?: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  theme?: string;
  status: EventStatus;
  createdAt: number;
  updatedAt: number;

  functions?: Record<string, EventFunction>;
  budget?: {
    total: number;
    categories?: Record<string, BudgetCategory>;
    expenses?: Record<string, Expense>;
  };
  vendors?: Record<string, Vendor>;
  tasks?: Record<string, Task>;
  guests?: Record<string, Guest>;
  moodboards?: Record<string, Moodboard>;
  collaborators?: Record<string, Collaborator>;
  activity?: Record<string, ActivityItem>;
}

