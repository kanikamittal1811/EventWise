import { useMemo } from 'react';
import { useEvent } from './useEvent';
import { GuestService } from '../services/guest/guestService';
import { GuestFormData } from '../schemas/guest.schema';
import { Guest } from '../types/guest';

export function useGuests() {
  const { event, guestSummary } = useEvent();

  const guests = useMemo(() => {
    if (!event?.guests) return [];
    return Object.values(event.guests).sort((a, b) => a.name.localeCompare(b.name));
  }, [event?.guests]);

  const addGuest = async (data: GuestFormData) => {
    if (!event) return;
    return await GuestService.addGuest(event.id, data);
  };

  const updateGuest = async (guestId: string, updates: Partial<Guest>) => {
    if (!event) return;
    await GuestService.updateGuest(event.id, guestId, updates);
  };

  const toggleInvitationSent = async (guestId: string, sent: boolean) => {
    if (!event) return;
    await GuestService.toggleInvitationSent(event.id, guestId, sent);
  };

  const deleteGuest = async (guestId: string) => {
    if (!event) return;
    await GuestService.deleteGuest(event.id, guestId);
  };

  return {
    guests,
    summary: guestSummary,
    addGuest,
    updateGuest,
    toggleInvitationSent,
    deleteGuest,
  };
}

