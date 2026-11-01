import React, { useState } from 'react';
import { Plus, Sparkles, CalendarDays, ArrowRight } from 'lucide-react';
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

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { events, loading } = useEvents();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            Welcome back, {user?.displayName || 'Planner'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Realtime intelligence &amp; planning workspace for your upcoming celebrations.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon={Plus}
          className="shrink-0"
        >
          Create Event
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your event portfolio..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No events in planning yet"
          description="Create your first wedding, birthday, or corporate summit. You can use our GenAI natural language prompt to generate everything in seconds."
          actionLabel="Plan an Event with AI"
          onAction={() => setShowCreateModal(true)}
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

