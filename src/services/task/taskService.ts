import { ref, set, update, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { Task, TaskStatus } from '../../types/task';
import { TaskFormData } from '../../schemas/task.schema';
import { LOCAL_EVENTS_KEY, notifyLocalEventsChanged, getLocalDemoEvents } from '../../constants/dummyData';

function getLocalEvents(): any {
  return getLocalDemoEvents();
}

function saveLocalEvents(events: any) {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[TaskService] Failed to write localStorage:', err);
  }
  notifyLocalEventsChanged();
}

export const TaskService = {
  async addTask(eventId: string, data: TaskFormData): Promise<string> {
    const taskId = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const task: Task = {
      id: taskId,
      title: data.title,
      description: data.description || '',
      category: data.category || 'General',
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      relativeDeadline: data.relativeDeadline || '',
      assigneeName: data.assigneeName || '',
      assigneeEmail: data.assigneeEmail || '',
      functionId: data.functionId || '',
      dependencies: [],
      createdAt: now,
      updatedAt: now,
    };

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].tasks) events[eventId].tasks = {};
      events[eventId].tasks[taskId] = task;
      events[eventId].updatedAt = now;
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return taskId;
    }

    try {
      await set(ref(database, `events/${eventId}/tasks/${taskId}`), task);
      await update(ref(database, `events/${eventId}`), { updatedAt: now });
    } catch (err) {
      console.warn(`[TaskService] Firebase addTask failed for ${eventId}:`, err);
    }
    return taskId;
  },

  async updateTask(eventId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const now = Date.now();
    const safeUpdates: Partial<Task> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.status === 'completed' && !updates.completedAt) {
      safeUpdates.completedAt = now;
    } else if (updates.status && updates.status !== 'completed') {
      safeUpdates.completedAt = undefined;
    }

    const events = getLocalEvents();
    if (events[eventId]?.tasks?.[taskId]) {
      events[eventId].tasks[taskId] = {
        ...events[eventId].tasks[taskId],
        ...safeUpdates,
      };
      events[eventId].updatedAt = now;
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}/tasks/${taskId}`), safeUpdates);
      await update(ref(database, `events/${eventId}`), { updatedAt: now });
    } catch (err) {
      console.warn(`[TaskService] Firebase updateTask failed for ${eventId}:`, err);
    }
  },

  async toggleTaskStatus(
    eventId: string,
    taskId: string,
    currentStatus: TaskStatus
  ): Promise<TaskStatus> {
    const newStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    await this.updateTask(eventId, taskId, { status: newStatus });
    return newStatus;
  },

  async deleteTask(eventId: string, taskId: string): Promise<void> {
    const events = getLocalEvents();
    if (events[eventId]?.tasks?.[taskId]) {
      delete events[eventId].tasks[taskId];
      events[eventId].updatedAt = Date.now();
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await remove(ref(database, `events/${eventId}/tasks/${taskId}`));
      await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
    } catch (err) {
      console.warn(`[TaskService] Firebase deleteTask failed for ${eventId}:`, err);
    }
  },

  async batchAddTasks(
    eventId: string,
    tasks: Array<{
      title: string;
      category?: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      dueDate: string;
      relativeDeadline?: string;
      description?: string;
    }>
  ): Promise<void> {
    const now = Date.now();
    const tasksMap: Record<string, Task> = {};

    tasks.forEach((t, i) => {
      const taskId = `tsk_${now}_${i}`;
      tasksMap[taskId] = {
        id: taskId,
        title: t.title,
        description: t.description || '',
        category: t.category || 'General',
        priority: t.priority,
        status: 'todo',
        dueDate: t.dueDate,
        relativeDeadline: t.relativeDeadline || '',
        createdAt: now,
        updatedAt: now,
      };
    });

    const events = getLocalEvents();
    if (events[eventId]) {
      if (!events[eventId].tasks) events[eventId].tasks = {};
      Object.assign(events[eventId].tasks, tasksMap);
      events[eventId].updatedAt = now;
      saveLocalEvents(events);
    }

    if (!isFirebaseConfigured || !database || eventId.startsWith('demo_')) {
      return;
    }

    try {
      await update(ref(database, `events/${eventId}/tasks`), tasksMap);
      await update(ref(database, `events/${eventId}`), { updatedAt: now });
    } catch (err) {
      console.warn(`[TaskService] Firebase batchAddTasks failed for ${eventId}:`, err);
    }
  },
};
