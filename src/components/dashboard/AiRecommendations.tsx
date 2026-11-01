import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../types/event';
import { Card } from '../common/Card';

export const AiRecommendations: React.FC<{ events: EventItem[] }> = ({ events }) => {
  const activeEvent = events[0];

  if (!activeEvent) {
    return (
      <Card className="bg-gradient-to-br from-primary-50/70 to-accent-50/40 border-primary-100">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>GenAI Assistant Insights</span>
        </div>
        <h4 className="text-base font-serif font-bold text-charcoal">
          Plan your first celebration with EventWise
        </h4>
        <p className="text-xs text-charcoal-600 mt-1 mb-4 leading-relaxed">
          Describe any event idea in plain words, and our Gemini engine will generate a full financial budget, milestone timeline, function schedule, and aesthetic theme in seconds.
        </p>
      </Card>
    );
  }

  const recommendations = [
    {
      title: 'Budget Allocation Health Check',
      description: `For ${activeEvent.name}, allocating ~35% towards the venue and ~25% for catering ensures optimal guest satisfaction while leaving headroom for custom staging.`,
      action: `/events/${activeEvent.id}/budget`,
      actionLabel: 'Review Budget',
      icon: TrendingUp,
    },
    {
      title: 'Milestone Timelines',
      description: `Lock in key vendors (venue, catering, photography) at least 3 months prior to negotiate competitive package rates.`,
      action: `/events/${activeEvent.id}/tasks`,
      actionLabel: 'View Checklist',
      icon: Lightbulb,
    },
  ];

  return (
    <Card className="bg-white border-charcoal-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary-100 text-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          </div>
          <h4 className="text-sm font-semibold text-charcoal">
            Intelligent Planning Tips for {activeEvent.name}
          </h4>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          AI Copilot
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-background-subtle/60 border border-charcoal-100/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span>{rec.title}</span>
                </div>
                <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                  {rec.description}
                </p>
              </div>
              <Link
                to={rec.action}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-700"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

