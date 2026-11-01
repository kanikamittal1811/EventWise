import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Edit3, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { eventSchema, EventFormData } from '../../schemas/event.schema';
import { EVENT_CATEGORIES, CURRENCY_OPTIONS } from '../../constants/categories';
import { EventService } from '../../services/event/eventService';
import { BudgetService } from '../../services/budget/budgetService';
import { TaskService } from '../../services/task/taskService';
import { AiService } from '../../services/gemini/aiService';
import { useAuth } from '../../hooks/useAuth';
import { AiGeneratedEventPlan } from '../../types/ai';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLocation, setAiLocation] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AiGeneratedEventPlan | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: 'wedding',
      guestCount: 150,
      totalBudget: 1500000,
      currency: 'INR',
      eventDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);

    try {
      const plan = await AiService.generateEventPlan({
        prompt: aiPrompt,
        location: aiLocation,
      });
      setGeneratedPlan(plan);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate event plan. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveAiPlan = async () => {
    if (!generatedPlan || !user) return;
    setSaving(true);
    try {
      const overview = generatedPlan.eventOverview;
      const eventId = await EventService.createEvent(
        user.uid,
        {
          name: overview.name,
          category: overview.category,
          description: overview.description,
          location: aiLocation || 'Jaipur',
          eventDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          guestCount: overview.guestCount,
          totalBudget: overview.estimatedBudget,
          currency: overview.currency || 'INR',
          theme: generatedPlan.creativeIdeas?.themeTitle || overview.theme,
        },
        false // Do not generate generic categories, we will populate AI categories!
      );

      // Apply AI Budget allocations
      if (generatedPlan.budgetAllocations) {
        await BudgetService.applyAiBudgetPlan(eventId, generatedPlan.budgetAllocations);
      }

      // Add AI tasks
      if (generatedPlan.tasks && generatedPlan.tasks.length > 0) {
        await TaskService.batchAddTasks(
          eventId,
          generatedPlan.tasks.map((t) => ({
            title: t.title,
            category: t.category,
            priority: t.priority,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            relativeDeadline: t.relativeDeadline,
            description: t.description,
          }))
        );
      }

      // Add functions if multi-day
      if (generatedPlan.functions && generatedPlan.functions.length > 0) {
        for (const fn of generatedPlan.functions) {
          await EventService.addEventFunction(eventId, {
            name: fn.name,
            date: new Date(Date.now() + (120 + fn.relativeDay) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: fn.description,
            startTime: fn.suggestedTiming,
          });
        }
      }

      onClose();
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      setAiError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const onManualSubmit = async (data: EventFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      const eventId = await EventService.createEvent(user.uid, data, true);
      reset();
      onClose();
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      description="Plan with Gemini AI intelligence or customize manually"
      maxWidth="2xl"
    >
      {/* Mode switcher */}
      <div
        role="tablist"
        aria-label="Event creation method"
        className="flex p-1 bg-background-subtle rounded-2xl mb-6 border border-charcoal-100"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'ai'}
          onClick={() => {
            setMode('ai');
            setGeneratedPlan(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            mode === 'ai'
              ? 'bg-white text-primary shadow-sm font-bold'
              : 'text-charcoal-600 hover:text-charcoal'
          }`}
        >
          <Sparkles className="w-4 h-4 text-accent-500" aria-hidden="true" />
          <span>GenAI Natural Language Planner</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'manual'}
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            mode === 'manual'
              ? 'bg-white text-primary shadow-sm font-bold'
              : 'text-charcoal-600 hover:text-charcoal'
          }`}
        >
          <Edit3 className="w-4 h-4" aria-hidden="true" />
          <span>Manual Form Builder</span>
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="space-y-4">
          {!generatedPlan ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
                  Describe what you are planning
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Plan a 3-day royal destination wedding in Jaipur for 250 guests with a budget of ₹25 Lakh including Sangeet and Haldi functions."
                  className="w-full bg-white border border-charcoal-200 text-charcoal placeholder-charcoal-400 text-sm rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Destination / City"
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={aiLocation}
                  onChange={(e) => setAiLocation(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
                    Quick Prompt Inspiration
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAiPrompt('3-day destination wedding in Udaipur for 200 people with ₹20 lakh budget');
                        setAiLocation('Udaipur');
                      }}
                      className="text-[11px] bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 px-2 py-1 rounded-lg border border-charcoal-200"
                    >
                      💍 Destination Wedding
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiPrompt('1st Birthday celebration with safari theme for 60 guests with ₹1.5 lakh budget');
                        setAiLocation('Bangalore');
                      }}
                      className="text-[11px] bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 px-2 py-1 rounded-lg border border-charcoal-200"
                    >
                      🎂 Safari Birthday
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiPrompt('Annual corporate leadership summit & gala dinner for 120 executives with ₹8 lakh budget');
                        setAiLocation('Mumbai');
                      }}
                      className="text-[11px] bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 px-2 py-1 rounded-lg border border-charcoal-200"
                    >
                      💼 Corporate Summit
                    </button>
                  </div>
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  loading={aiGenerating}
                  icon={Sparkles}
                  disabled={!aiPrompt.trim()}
                >
                  Generate Complete Plan with AI
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                    AI Curated Blueprint
                  </span>
                  <span className="text-xs font-semibold text-primary-800">
                    {generatedPlan.eventOverview.currency} {generatedPlan.eventOverview.estimatedBudget.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-charcoal mt-1">
                  {generatedPlan.eventOverview.name}
                </h4>
                <p className="text-xs text-charcoal-600 mt-1">
                  {generatedPlan.eventOverview.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-primary-200 font-medium">
                    👥 {generatedPlan.eventOverview.guestCount} Guests
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-primary-200 font-medium">
                    🎨 {generatedPlan.creativeIdeas?.themeTitle || generatedPlan.eventOverview.theme}
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-primary-200 font-medium">
                    🗓️ {generatedPlan.functions?.length || 1} Functions
                  </span>
                </div>
              </div>

              {/* Budget allocations preview */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-charcoal-600 mb-2">
                  Generated Budget Allocations
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {generatedPlan.budgetAllocations.slice(0, 6).map((b, i) => (
                    <div key={i} className="p-2.5 bg-background-subtle rounded-xl text-xs border border-charcoal-100">
                      <div className="text-charcoal-500 truncate">{b.category}</div>
                      <div className="font-semibold text-charcoal mt-0.5">
                        {generatedPlan.eventOverview.currency} {b.allocatedAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-charcoal-400">{b.percentage}% of total</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks preview */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-charcoal-600 mb-2">
                  Milestone Tasks ({generatedPlan.tasks.length})
                </h5>
                <ul className="space-y-1.5 text-xs text-charcoal-700">
                  {generatedPlan.tasks.slice(0, 3).map((t, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-charcoal-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate">{t.title}</span>
                      <span className="ml-auto text-[10px] text-charcoal-400 shrink-0">{t.relativeDeadline}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-charcoal-100">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="text-xs text-charcoal-500 hover:text-charcoal font-medium"
                >
                  ← Edit Prompt
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Discard
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAiPlan}
                    loading={saving}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Accept & Create Workspace
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
          <Input
            label="Event Name"
            placeholder="e.g. Vikram & Maya Wedding"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Category"
              options={EVENT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
              error={errors.category?.message}
              {...register('category')}
            />

            <Input
              label="Location / Venue"
              placeholder="e.g. The Oberoi Udaivilas, Udaipur"
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Event Date"
              type="date"
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Input
              label="Guest Count"
              type="number"
              placeholder="150"
              error={errors.guestCount?.message}
              {...register('guestCount')}
            />

            <Select
              label="Currency"
              options={CURRENCY_OPTIONS.map((cur) => ({ value: cur.code, label: `${cur.code} (${cur.symbol})` }))}
              {...register('currency')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Budget"
              type="number"
              placeholder="1500000"
              error={errors.totalBudget?.message}
              {...register('totalBudget')}
            />

            <Input
              label="Theme / Style (Optional)"
              placeholder="e.g. Contemporary Royal Floral"
              error={errors.theme?.message}
              {...register('theme')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Event Workspace
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
