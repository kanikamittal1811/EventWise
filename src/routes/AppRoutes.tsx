import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Route-level code splitting for optimized chunking and initial load performance
const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('../pages/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const EventsPage = lazy(() =>
  import('../pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventWorkspacePage = lazy(() =>
  import('../pages/EventWorkspacePage').then((m) => ({ default: m.EventWorkspacePage }))
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const PageFallback: React.FC<{ message?: string }> = ({ message = 'Loading workspace...' }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner message={message} />
  </div>
);

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
    <Suspense fallback={<PageFallback message="Loading EventWise..." />}>
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
    </Suspense>
  );
};

