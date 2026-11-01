import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CreateEventModal } from '../events/CreateEventModal';

export const AppLayout: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

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

