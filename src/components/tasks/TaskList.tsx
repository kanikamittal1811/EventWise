import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTasks } from '../../hooks/useTasks';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Task, TaskStatus } from '../../types/task';

export const TaskList: React.FC<{
  onAddNew: () => void;
  onEdit: (task: Task) => void;
  onOpenAiGenerator: () => void;
}> = ({ onAddNew, onEdit, onOpenAiGenerator }) => {
  const { tasks, progress, toggleTaskStatus, deleteTask } = useTasks();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const handleToggle = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = await toggleTaskStatus(taskId, currentStatus);
    if (newStatus === 'completed') {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Progress Card */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-charcoal">Overall Milestone Progress</span>
            <span className="font-bold text-primary">
              {progress.completed} of {progress.total} tasks completed ({progress.percentage}%)
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Overall Milestone Progress"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2.5 bg-charcoal-100 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={onOpenAiGenerator} variant="secondary" size="sm" icon={Sparkles}>
            AI Checklists
          </Button>
          <Button onClick={onAddNew} variant="primary" size="sm" icon={Plus}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter tasks by status"
        className="flex items-center gap-2 border-b border-charcoal-100 pb-2 text-xs"
      >
        {['all', 'todo', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            role="tab"
            aria-selected={filterStatus === status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              filterStatus === status
                ? 'bg-primary text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal hover:bg-charcoal-50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task Rows */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks in this view"
          description="Keep your event planning on track with detailed milestones and checklists."
          actionLabel="Add Your First Task"
          onAction={onAddNew}
          aiSuggestedPrompt="Generate a 1-week final countdown task checklist"
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white border transition-all flex items-start sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-charcoal-100 opacity-60 bg-background-subtle/30'
                    : 'border-charcoal-200/70 shadow-subtle hover:border-primary/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isCompleted}
                    aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                    onClick={() => handleToggle(task.id, task.status)}
                    className="mt-0.5 sm:mt-0 text-charcoal-300 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-charcoal-500' : 'text-charcoal'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.category && (
                        <span className="text-[10px] font-semibold text-charcoal-600 bg-charcoal-50 px-2 py-0.5 rounded-md border border-charcoal-100">
                          {task.category}
                        </span>
                      )}
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'danger'
                            : task.priority === 'high'
                            ? 'warning'
                            : task.priority === 'medium'
                            ? 'secondary'
                            : 'neutral'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-charcoal-600 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <div className="hidden sm:flex items-center gap-1.5 text-charcoal-500">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-charcoal-400">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      aria-label={`Edit task "${task.title}"`}
                      className="p-1.5 hover:text-charcoal hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                      aria-label={`Delete task "${task.title}"`}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

