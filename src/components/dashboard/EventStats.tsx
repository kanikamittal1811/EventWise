import React from 'react';
import { Calendar, Wallet, CheckSquare, Users } from 'lucide-react';
import { EventItem } from '../../types/event';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

export const EventStats: React.FC<{ events: EventItem[] }> = ({ events }) => {
  const totalEvents = events.length;

  let totalBudget = 0;
  let totalTasksPending = 0;
  let totalGuests = 0;

  events.forEach((evt) => {
    totalBudget += Number(evt.totalBudget) || 0;
    totalGuests += Number(evt.guestCount) || 0;
    if (evt.tasks) {
      const pending = Object.values(evt.tasks).filter((t) => t.status !== 'completed').length;
      totalTasksPending += pending;
    }
  });

  const stats = [
    {
      label: 'Active Events',
      value: totalEvents,
      icon: Calendar,
      color: 'text-primary bg-primary-50 border-primary-200',
    },
    {
      label: 'Combined Budget',
      value: formatCurrency(totalBudget, events[0]?.currency || 'INR'),
      icon: Wallet,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending Milestones',
      value: totalTasksPending,
      icon: CheckSquare,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Total Guests Expected',
      value: totalGuests,
      icon: Users,
      color: 'text-accent-600 bg-accent-50 border-accent-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={idx} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                {s.label}
              </span>
              <div className={`p-2 rounded-xl border ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-serif font-bold text-xl sm:text-2xl text-charcoal truncate">
              {s.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

