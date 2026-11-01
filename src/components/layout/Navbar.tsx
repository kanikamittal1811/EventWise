import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, Database, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Navbar: React.FC<{ onNewEvent?: () => void }> = ({ onNewEvent }) => {
  const { user, logout, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-charcoal-100">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-semibold text-sm"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" aria-label="EventWise Home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-charcoal tracking-tight">EventWise</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
              AI Planner
            </span>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {!isFirebaseConfigured && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Offline / Demo Mode</span>
            </div>
          )}

          {onNewEvent && (
            <Button
              onClick={onNewEvent}
              variant="primary"
              size="sm"
              icon={Plus}
              className="shadow-sm"
            >
              <span className="hidden sm:inline">New Event</span>
            </Button>
          )}

          {/* User profile button */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-charcoal-200">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-semibold text-xs flex items-center justify-center border border-primary-200"
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-charcoal-700 max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                aria-label="Log out"
                title="Log out"
                className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

