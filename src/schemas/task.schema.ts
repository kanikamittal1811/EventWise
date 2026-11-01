import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  dueDate: z.string().min(1, 'Due date is required'),
  relativeDeadline: z.string().optional(),
  assigneeName: z.string().optional(),
  assigneeEmail: z.string().email('Invalid email address').or(z.literal('')).optional(),
  functionId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

