import { useMemo } from 'react';
import { useEvent } from './useEvent';
import { TaskService } from '../services/task/taskService';
import { TaskFormData } from '../schemas/task.schema';
import { Task, TaskStatus } from '../types/task';

export function useTasks() {
  const { event, taskProgress } = useEvent();

  const tasks = useMemo(() => {
    if (!event?.tasks) return [];
    return Object.values(event.tasks).sort((a, b) => {
      // Incomplete tasks first, then sorted by due date
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [event?.tasks]);

  const addTask = async (data: TaskFormData) => {
    if (!event) return;
    return await TaskService.addTask(event.id, data);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!event) return;
    await TaskService.updateTask(event.id, taskId, updates);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    if (!event) return 'todo';
    return await TaskService.toggleTaskStatus(event.id, taskId, currentStatus);
  };

  const deleteTask = async (taskId: string) => {
    if (!event) return;
    await TaskService.deleteTask(event.id, taskId);
  };

  const batchAddTasks = async (
    newTasks: Array<{
      title: string;
      category?: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      dueDate: string;
      relativeDeadline?: string;
      description?: string;
    }>
  ) => {
    if (!event) return;
    await TaskService.batchAddTasks(event.id, newTasks);
  };

  return {
    tasks,
    progress: taskProgress,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    batchAddTasks,
  };
}

