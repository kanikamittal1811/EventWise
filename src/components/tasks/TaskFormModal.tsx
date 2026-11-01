import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { taskSchema, TaskFormData } from '../../schemas/task.schema';
import { Task } from '../../types/task';

export const TaskFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      category: 'General',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        category: initialData.category || 'General',
        priority: initialData.priority,
        status: initialData.status,
        dueDate: initialData.dueDate,
        relativeDeadline: initialData.relativeDeadline || '',
        assigneeName: initialData.assigneeName || '',
        assigneeEmail: initialData.assigneeEmail || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        title: '',
        category: 'General',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Add Milestone Task'}
      description="Keep your event planning on schedule"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Schedule venue tasting appointment"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category"
            placeholder="e.g. Catering, Decor, Invitations"
            error={errors.category?.message}
            {...register('category')}
          />

          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Select
            label="Status"
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Input
          label="Assignee Name (Optional)"
          placeholder="e.g. Sister of the Bride, Planner"
          error={errors.assigneeName?.message}
          {...register('assigneeName')}
        />

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
            Description &amp; Action Notes
          </label>
          <textarea
            placeholder="Key phone numbers, reference links, deliverables..."
            className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary min-h-[70px]"
            {...register('description')}
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-charcoal-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initialData ? 'Update Task' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

