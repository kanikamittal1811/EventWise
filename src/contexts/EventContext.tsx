import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventItem } from '../types/event';
import { BudgetSummary } from '../types/budget';
import { GuestSummary } from '../types/guest';
import { EventService } from '../services/event/eventService';
import {
  calculateBudgetSummary,
  calculateGuestMetrics,
  calculateTaskProgress,
} from '../utils/calculations';
import { useAuth } from './AuthContext';

interface EventContextType {
  event: EventItem | null;
  loading: boolean;
  error: string | null;
  budgetSummary: BudgetSummary;
  guestSummary: GuestSummary;
  taskProgress: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    percentage: number;
  };
  updateEvent: (updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates on active event
    const unsubscribe = EventService.subscribeToEvent(eventId, (eventData) => {
      if (eventData) {
        setEvent(eventData);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found or you do not have permission to access it.');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [eventId]);

  const budgetSummary = useMemo(() => {
    if (!event) {
      return {
        totalBudget: 0,
        totalAllocated: 0,
        totalUnallocated: 0,
        totalSpent: 0,
        totalPending: 0,
        remainingBudget: 0,
        percentageUsed: 0,
      };
    }
    return calculateBudgetSummary(
      event.totalBudget || 0,
      event.budget?.categories || {},
      event.budget?.expenses || {}
    );
  }, [event]);

  const guestSummary = useMemo(() => {
    if (!event) {
      return {
        totalInvited: 0,
        totalAttending: 0,
        totalDeclined: 0,
        totalPending: 0,
        totalPlusOnes: 0,
        dietaryBreakdown: {},
      };
    }
    return calculateGuestMetrics(event.guests || {});
  }, [event]);

  const taskProgress = useMemo(() => {
    if (!event) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0, percentage: 0 };
    }
    return calculateTaskProgress(event.tasks || {});
  }, [event]);

  const updateEvent = useCallback(
    async (updates: Partial<EventItem>) => {
      if (!eventId) return;
      await EventService.updateEvent(eventId, updates);
    },
    [eventId]
  );

  const deleteEvent = useCallback(
    async () => {
      if (!eventId || !user) return;
      await EventService.deleteEvent(eventId, user.uid);
      navigate('/events');
    },
    [eventId, user, navigate]
  );

  const contextValue = useMemo<EventContextType>(
    () => ({
      event,
      loading,
      error,
      budgetSummary,
      guestSummary,
      taskProgress,
      updateEvent,
      deleteEvent,
    }),
    [event, loading, error, budgetSummary, guestSummary, taskProgress, updateEvent, deleteEvent]
  );

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

export const useOptionalEvent = () => {
  return useContext(EventContext) || null;
};

