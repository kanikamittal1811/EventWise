import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { vendorSchema, VendorFormData } from '../../schemas/vendor.schema';
import { VENDOR_CATEGORIES } from '../../constants/categories';
import { Vendor } from '../../types/vendor';

export const VendorFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormData) => Promise<void>;
  initialData?: Partial<Vendor> | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      category: 'venue',
      quotation: 0,
      negotiatedPrice: 0,
      bookingStatus: 'inquired',
      paymentStatus: 'unpaid',
      contactName: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || 'venue',
        quotation: initialData.quotation || 0,
        negotiatedPrice: initialData.negotiatedPrice || 0,
        bookingStatus: initialData.bookingStatus || 'inquired',
        paymentStatus: initialData.paymentStatus || 'unpaid',
        contactName: initialData.contactName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        notes: initialData.notes || '',
        rating: initialData.rating,
      });
    } else {
      reset({
        name: '',
        category: 'venue',
        quotation: 0,
        negotiatedPrice: 0,
        bookingStatus: 'inquired',
        paymentStatus: 'unpaid',
        contactName: '',
        phone: '',
        email: '',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: VendorFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Vendor Record' : 'Add New Vendor'}
      description="Track quotes, contacts, and contract commitments"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vendor / Business Name"
            placeholder="e.g. Royal Palace Banquets"
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label="Category"
            options={VENDOR_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Initial Quotation"
            type="number"
            placeholder="0"
            error={errors.quotation?.message}
            {...register('quotation')}
          />

          <Input
            label="Negotiated Price"
            type="number"
            placeholder="0"
            error={errors.negotiatedPrice?.message}
            {...register('negotiatedPrice')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Booking Status"
            options={[
              { value: 'inquired', label: 'Inquired' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'negotiating', label: 'Negotiating' },
              { value: 'booked', label: 'Booked / Confirmed' },
              { value: 'declined', label: 'Declined' },
            ]}
            error={errors.bookingStatus?.message}
            {...register('bookingStatus')}
          />

          <Select
            label="Payment Status"
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'deposit_paid', label: 'Advance Deposit Paid' },
              { value: 'fully_paid', label: 'Fully Paid' },
            ]}
            error={errors.paymentStatus?.message}
            {...register('paymentStatus')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Point of Contact"
            placeholder="e.g. Ramesh Sharma"
            error={errors.contactName?.message}
            {...register('contactName')}
          />

          <Input
            label="Phone"
            placeholder="919876543210"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email"
            placeholder="contact@vendor.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
            Notes &amp; Scope of Work
          </label>
          <textarea
            placeholder="Deliverables, stage dimensions, menu inclusions, timing clauses..."
            className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary min-h-[70px]"
            {...register('notes')}
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-charcoal-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initialData ? 'Update Vendor' : 'Save Vendor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

