import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { EventProvider, useEvent } from '../../contexts/EventContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CreateEventModal } from '../events/CreateEventModal';

const WorkspaceContent: React.FC = () => {
  const { loading, error } = useEvent();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Syncing event workspace..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-red-200 text-center shadow-card">
            <h3 className="text-lg font-serif font-bold text-red-600 mb-2">Unable to Load Event</h3>
            <p className="text-sm text-charcoal-600 mb-6">{error}</p>
            <a
              href="/events"
              className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-800 transition-colors"
            >
              Back to My Events
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onNewEvent={() => setShowCreateModal(true)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export const WorkspaceLayout: React.FC = () => {
  return (
    <EventProvider>
      <WorkspaceContent />
    </EventProvider>
  );
};

