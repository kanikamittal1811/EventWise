import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { EVENT_CATEGORIES } from '../constants/categories';

export const EventsPage: React.FC = () => {
  const { events, loading } = useEvents();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">My Events</h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Access, manage, and collaborate across all your celebration workspaces.
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

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-charcoal-100 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background-subtle rounded-xl text-xs text-charcoal placeholder-charcoal-400 border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-background-subtle border border-charcoal-200 rounded-xl px-3 py-2 text-charcoal font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No events match your search"
          description="Try clearing your search filters or create a new event workspace."
          actionLabel="Create Event"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

