import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Wallet,
  Store,
  CheckSquare,
  Users,
  Palette,
  FileText,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useEvent } from '../../hooks/useEvent';

export const Sidebar: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  let eventContext: any = null;
  try {
    // If inside EventProvider
    eventContext = useEvent();
  } catch {
    // Outside event context
  }

  const isWorkspace = Boolean(eventId);

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
  }

  const mainNav: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'My Events', icon: CalendarDays },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const workspaceNav: NavItem[] = [
    { to: `/events/${eventId}`, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: `/events/${eventId}/ai`, label: 'AI Planner', icon: Sparkles },
    { to: `/events/${eventId}/budget`, label: 'Budget & Spend', icon: Wallet },
    { to: `/events/${eventId}/vendors`, label: 'Vendors', icon: Store },
    { to: `/events/${eventId}/tasks`, label: 'Timeline & Tasks', icon: CheckSquare },
    { to: `/events/${eventId}/guests`, label: 'Guest List', icon: Users },
    { to: `/events/${eventId}/creative`, label: 'Creative Studio', icon: Palette },
    { to: `/events/${eventId}/documents`, label: 'Invitations & Cards', icon: FileText },
  ];

  const navItems = isWorkspace ? workspaceNav : mainNav;

  return (
    <aside
      aria-label="Sidebar navigation"
      className="w-64 bg-background-card border-r border-charcoal-100 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]"
    >
      {isWorkspace && (
        <div className="p-4 border-b border-charcoal-100">
          <NavLink
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-primary transition-colors mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>All Events</span>
          </NavLink>
          <div className="bg-background-subtle/70 p-3 rounded-xl border border-charcoal-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">
              Active Workspace
            </span>
            <p className="text-sm font-semibold text-charcoal truncate mt-0.5">
              {eventContext?.event?.name || 'Loading Event...'}
            </p>
            <p className="text-xs text-charcoal-500 capitalize mt-0.5">
              {eventContext?.event?.category || 'Planning'} • {eventContext?.event?.guestCount || 0} Guests
            </p>
          </div>
        </div>
      )}

      <nav
        aria-label={isWorkspace ? 'Workspace Navigation' : 'Main Navigation'}
        className="flex-1 py-4 px-3 space-y-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20 font-semibold'
                    : 'text-charcoal-600 hover:bg-background-subtle hover:text-charcoal'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {isWorkspace && eventContext?.budgetSummary && (
        <div className="p-4 border-t border-charcoal-100 m-3 rounded-2xl bg-background-subtle/50 text-xs">
          <div className="flex justify-between items-center mb-1 text-charcoal-600 font-medium">
            <span>Budget Utilized</span>
            <span className="font-semibold text-charcoal">
              {eventContext.budgetSummary.percentageUsed}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Budget Utilized"
            aria-valuenow={Math.round(eventContext.budgetSummary.percentageUsed)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-1.5 bg-charcoal-200 rounded-full overflow-hidden"
          >
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                eventContext.budgetSummary.percentageUsed > 90
                  ? 'bg-red-500'
                  : eventContext.budgetSummary.percentageUsed > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(100, eventContext.budgetSummary.percentageUsed)}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
