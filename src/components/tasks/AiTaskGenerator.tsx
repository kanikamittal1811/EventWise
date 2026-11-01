import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTasks } from '../../hooks/useTasks';
import { useEvent } from '../../hooks/useEvent';
import { AiService } from '../../services/gemini/aiService';

export const AiTaskGenerator: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { event } = useEvent();
  const { batchAddTasks } = useTasks();

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!event) return;
    setLoading(true);
    setError(null);

    try {
      const generated = await AiService.generateTasks({
        category: event.category,
        eventDate: event.eventDate,
        functions: event.functions ? Object.values(event.functions) : [],
      });
      setTasks(generated);
      setSelectedIndices(generated.map((_: any, idx: number) => idx)); // select all by default
    } catch (err: any) {
      setError(err.message || 'Failed to generate task recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleAddSelected = async () => {
    if (!event) return;
    setSaving(true);

    try {
      const selectedTasks = selectedIndices.map((idx) => {
        const t = tasks[idx];
        return {
          title: t.title,
          category: t.category || 'Milestone',
          priority: t.priority || 'medium',
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          relativeDeadline: t.relativeDeadline,
          description: t.description,
        };
      });

      await batchAddTasks(selectedTasks);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add tasks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Milestone Checklist Generator"
      description="Context-aware task generation for your event timeline"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-accent-500" />
            </div>
            <p className="text-sm text-charcoal-600 max-w-sm mx-auto">
              EventWise AI will analyze your <strong>{event?.name}</strong> ({event?.category}) date and generate essential milestone tasks.
            </p>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 max-w-sm mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button onClick={handleGenerate} loading={loading} icon={Sparkles}>
              Generate Checklist Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex justify-between items-center text-xs text-charcoal-500 px-1">
              <span>{selectedIndices.length} tasks selected</span>
              <button
                type="button"
                onClick={() =>
                  setSelectedIndices(
                    selectedIndices.length === tasks.length ? [] : tasks.map((_, i) => i)
                  )
                }
                className="text-primary font-semibold hover:underline"
              >
                {selectedIndices.length === tasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((t, i) => {
                const isSelected = selectedIndices.includes(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-primary-50/50 border-primary-300'
                        : 'bg-white border-charcoal-100 hover:border-charcoal-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-charcoal-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal">{t.title}</div>
                      <div className="text-charcoal-500 mt-0.5 line-clamp-1">{t.description}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-charcoal-400">
                        <span className="font-semibold text-primary">{t.category}</span>
                        <span>•</span>
                        <span>{t.relativeDeadline}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-charcoal-100">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddSelected}
                loading={saving}
                disabled={selectedIndices.length === 0}
              >
                Add {selectedIndices.length} Selected Tasks
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

