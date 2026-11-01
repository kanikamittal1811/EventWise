import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Wallet, ArrowRight } from 'lucide-react';
import { EventItem } from '../../types/event';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate, formatCurrency, getDaysUntil } from '../../utils/formatters';
import { calculateBudgetSummary } from '../../utils/calculations';

export const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const countdown = getDaysUntil(event.eventDate);
  const budget = calculateBudgetSummary(
    event.totalBudget || 0,
    event.budget?.categories || {},
    event.budget?.expenses || {}
  );

  return (
    <Card hoverable className="flex flex-col justify-between group">
      <div>
        {/* Top header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="primary" size="sm">
            {event.category.replace('_', ' ')}
          </Badge>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              countdown.isPast
                ? 'bg-charcoal-100 text-charcoal-600'
                : countdown.days <= 7
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {countdown.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-serif font-bold text-charcoal group-hover:text-primary transition-colors line-clamp-1">
          {event.name}
        </h3>

        {/* Metadata */}
        <div className="mt-2.5 space-y-1.5 text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-charcoal-500 shrink-0" aria-hidden="true" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-charcoal-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-charcoal-500 shrink-0" aria-hidden="true" />
            <span>{event.guestCount} Expected Guests</span>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="mt-4 pt-4 border-t border-charcoal-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-charcoal-600 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" aria-hidden="true" /> Budget Spend
            </span>
            <span className="font-semibold text-charcoal">
              {formatCurrency(budget.totalSpent, event.currency)} / {formatCurrency(event.totalBudget, event.currency)}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`Budget spend for ${event.name}`}
            aria-valuenow={Math.round(budget.percentageUsed)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-1.5 bg-charcoal-100 rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budget.percentageUsed > 90
                  ? 'bg-red-500'
                  : budget.percentageUsed > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-700">
        <span>Open Planning Workspace</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </div>

      <Link
        to={`/events/${event.id}`}
        className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-2xl"
        aria-label={`Open workspace for ${event.name}`}
      />
    </Card>
  );
};

