export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  relativeDeadline?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  dependencies?: string[];
  functionId?: string;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

