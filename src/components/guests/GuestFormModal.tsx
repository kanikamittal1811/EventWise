import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { guestSchema, GuestFormData } from '../../schemas/guest.schema';
import { Guest } from '../../types/guest';

export const GuestFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuestFormData) => Promise<void>;
  initialData?: Guest | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      category: 'friends',
      rsvpStatus: 'pending',
      plusOnes: 0,
      dietaryPreferences: '',
      tableNumber: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        category: initialData.category,
        rsvpStatus: initialData.rsvpStatus,
        plusOnes: initialData.plusOnes || 0,
        dietaryPreferences: initialData.dietaryPreferences || '',
        tableNumber: initialData.tableNumber || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        category: 'friends',
        rsvpStatus: 'pending',
        plusOnes: 0,
        dietaryPreferences: '',
        tableNumber: '',
        email: '',
        phone: '',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: GuestFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Guest' : 'Add Guest to List'}
      description="Manage invitations, plus-ones, and dietary preferences"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Ananya & Partner"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={[
              { value: 'family', label: 'Family' },
              { value: 'close_friends', label: 'Close Friends' },
              { value: 'friends', label: 'Friends' },
              { value: 'colleagues', label: 'Colleagues / Work' },
              { value: 'vip', label: 'VIP Guests' },
              { value: 'other', label: 'Other' },
            ]}
            error={errors.category?.message}
            {...register('category')}
          />

          <Select
            label="RSVP Status"
            options={[
              { value: 'pending', label: 'Pending Response' },
              { value: 'attending', label: 'Attending' },
              { value: 'declined', label: 'Declined' },
              { value: 'tentative', label: 'Tentative' },
              { value: 'not_sent', label: 'Not Yet Sent' },
            ]}
            error={errors.rsvpStatus?.message}
            {...register('rsvpStatus')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plus-Ones Count"
            type="number"
            placeholder="0"
            error={errors.plusOnes?.message}
            {...register('plusOnes')}
          />

          <Input
            label="Table / Seating Group"
            placeholder="e.g. Table 4"
            error={errors.tableNumber?.message}
            {...register('tableNumber')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            placeholder="ananya@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone / WhatsApp"
            placeholder="919876543210"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Input
          label="Dietary Preferences"
          placeholder="e.g. Vegetarian, Jain, Vegan, Gluten-free"
          error={errors.dietaryPreferences?.message}
          {...register('dietaryPreferences')}
        />

        <div className="pt-3 flex justify-end gap-3 border-t border-charcoal-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initialData ? 'Update Guest' : 'Save Guest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

