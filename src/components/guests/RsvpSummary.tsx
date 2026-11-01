import React from 'react';
import { Users, CheckCircle2, XCircle, Clock, Utensils } from 'lucide-react';
import { Card } from '../common/Card';
import { useGuests } from '../../hooks/useGuests';

export const RsvpSummary: React.FC = () => {
  const { summary } = useGuests();

  const metrics = [
    {
      label: 'Total Invited',
      value: summary.totalInvited,
      sub: `${summary.totalPlusOnes} plus-ones`,
      icon: Users,
      color: 'text-primary bg-primary-50',
    },
    {
      label: 'Confirmed Attending',
      value: summary.totalAttending,
      sub: summary.totalInvited > 0 ? `${Math.round((summary.totalAttending / summary.totalInvited) * 100)}% attendance` : '0%',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Declined',
      value: summary.totalDeclined,
      sub: summary.totalInvited > 0 ? `${Math.round((summary.totalDeclined / summary.totalInvited) * 100)}% declined` : '0%',
      icon: XCircle,
      color: 'text-red-700 bg-red-50',
    },
    {
      label: 'Awaiting RSVP',
      value: summary.totalPending,
      sub: 'Needs follow-up',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50',
    },
  ];

  const dietKeys = Object.keys(summary.dietaryBreakdown);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wide">
                  {m.label}
                </span>
                <div className={`p-1.5 rounded-lg ${m.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-serif font-bold text-charcoal">
                {m.value}
              </div>
              <div className="text-[11px] text-charcoal-400 mt-0.5">{m.sub}</div>
            </Card>
          );
        })}
      </div>

      {dietKeys.length > 0 && (
        <div className="p-3 bg-white rounded-2xl border border-charcoal-100 flex items-center gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 text-charcoal-600 font-semibold shrink-0">
            <Utensils className="w-3.5 h-3.5 text-primary" />
            <span>Dietary Preferences:</span>
          </div>
          <div className="flex items-center gap-2">
            {dietKeys.map((diet) => (
              <span
                key={diet}
                className="px-2.5 py-1 rounded-full bg-background-subtle border border-charcoal-100 capitalize font-medium text-charcoal-700"
              >
                {diet}: {summary.dietaryBreakdown[diet]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

