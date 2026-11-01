import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface AddFunctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    date: string;
    startTime: string;
    venue: string;
  }) => Promise<void>;
}

export const AddFunctionModal: React.FC<AddFunctionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ name, date, startTime: time, venue });
      setName('');
      setDate('');
      setTime('');
      setVenue('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Event Function"
      description="For multi-day or multi-stage celebrations"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Function Name"
          placeholder="e.g. Sangeet & Cocktails"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Timing"
            placeholder="e.g. 7:00 PM - 11:30 PM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <Input
          label="Venue / Location"
          placeholder="e.g. Poolside Lawn"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save Function
          </Button>
        </div>
      </form>
    </Modal>
  );
};
