import { z } from 'zod';

export const budgetCategorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  allocatedAmount: z.coerce.number().min(0, 'Allocation cannot be negative'),
  color: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type BudgetCategoryFormData = z.infer<typeof budgetCategorySchema>;

export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(2, 'Expense title is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paidAmount: z.coerce.number().min(0, 'Paid amount cannot be negative'),
  status: z.enum(['pending', 'partial', 'paid']),
  vendorId: z.string().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

