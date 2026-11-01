import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EventsPage } from '../pages/EventsPage';
import { EventWorkspacePage } from '../pages/EventWorkspacePage';
import { SettingsPage } from '../pages/SettingsPage';
import { AppLayout } from '../components/layout/AppLayout';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner message="Checking session authentication..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Event Workspace Routes with Event Context Provider */}
      <Route
        element={
          <ProtectedRoute>
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/events/:eventId" element={<EventWorkspacePage />} />
        <Route path="/events/:eventId/:tab" element={<EventWorkspacePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

