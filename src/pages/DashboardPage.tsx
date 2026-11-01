import React, { useState } from 'react';
import { Plus, Sparkles, CalendarDays, ArrowRight, Database, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { EventStats } from '../components/dashboard/EventStats';
import { EventCard } from '../components/events/EventCard';
import { AiRecommendations } from '../components/dashboard/AiRecommendations';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { seedLocalDemoData, clearLocalDemoData } from '../constants/dummyData';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { events, loading } = useEvents();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const upcomingEvents = events.slice(0, 3);
  const hasDemoEvents = events.some((e) => e.id.startsWith('demo_'));

  const handleLoadDemo = () => {
    seedLocalDemoData(user?.uid || 'demo_google_user', true);
  };

  const handleClearDemo = () => {
    clearLocalDemoData();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
              Welcome back, {user?.displayName || 'Planner'}
            </h1>
            {hasDemoEvents && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-50 text-accent-700 border border-accent-200">
                <Sparkles className="w-3 h-3 text-accent-500" />
                Demo Mode Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Realtime intelligence &amp; planning workspace for your upcoming celebrations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {events.length > 0 ? (
            hasDemoEvents ? (
              <Button
                onClick={handleClearDemo}
                variant="outline"
                size="sm"
                icon={RotateCcw}
                className="text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50"
              >
                Reset Demo Data
              </Button>
            ) : (
              <Button
                onClick={handleLoadDemo}
                variant="outline"
                size="sm"
                icon={Database}
                className="text-primary border-primary-200 hover:bg-primary-50"
              >
                Load Sample Data
              </Button>
            )
          ) : null}

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            icon={Plus}
          >
            Create Event
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your event portfolio..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No events in planning yet"
          description="Create your first celebration with our GenAI prompt, or load instant demo data with pre-built budgets, vendors, and milestone schedules."
          actionLabel="Plan an Event with AI"
          onAction={() => setShowCreateModal(true)}
          secondaryActionLabel="Load Demo Celebrations"
          onSecondaryAction={handleLoadDemo}
          aiSuggestedPrompt="Plan a 3-day royal destination wedding in Udaipur for 200 people with ₹20 lakh budget"
        />
      ) : (
        <>
          {/* Aggregate Stats */}
          <EventStats events={events} />

          {/* AI Insights & Recommendations */}
          <AiRecommendations events={events} />

          {/* Upcoming Events Carousel/Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-charcoal">Upcoming Celebrations</h3>
              {events.length > 3 && (
                <Link
                  to="/events"
                  className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <span>View all {events.length}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </div>
        </>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

