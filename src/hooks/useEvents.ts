import { useEffect, useState } from 'react';
import { EventItem } from '../types/event';
import { EventService } from '../services/event/eventService';
import { useAuth } from './useAuth';

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isMounted = true;

    // Failsafe timeout to prevent any infinite loading state
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 4000);

    const unsubscribe = EventService.subscribeToUserEvents(user.uid, (userEvents) => {
      if (!isMounted) return;
      clearTimeout(timer);
      // Sort upcoming by eventDate ascending
      const sorted = [...userEvents].sort((a, b) => {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });
      setEvents(sorted);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [user]);

  return { events, loading };
}

