import { ref, set, update, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase/config';
import { Task, TaskStatus } from '../../types/task';
import { TaskFormData } from '../../schemas/task.schema';

const LOCAL_EVENTS_KEY = 'eventwise_demo_events';

function getLocalEvents(): any {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalEvents(events: any) {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
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

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]) {
        if (!events[eventId].tasks) events[eventId].tasks = {};
        events[eventId].tasks[taskId] = task;
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return taskId;
    }

    await set(ref(database, `events/${eventId}/tasks/${taskId}`), task);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
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

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.tasks?.[taskId]) {
        events[eventId].tasks[taskId] = {
          ...events[eventId].tasks[taskId],
          ...safeUpdates,
        };
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return;
    }

    await update(ref(database, `events/${eventId}/tasks/${taskId}`), safeUpdates);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
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
    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]?.tasks?.[taskId]) {
        delete events[eventId].tasks[taskId];
        events[eventId].updatedAt = Date.now();
        saveLocalEvents(events);
      }
      return;
    }

    await remove(ref(database, `events/${eventId}/tasks/${taskId}`));
    await update(ref(database, `events/${eventId}`), { updatedAt: Date.now() });
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

    if (!isFirebaseConfigured || !database) {
      const events = getLocalEvents();
      if (events[eventId]) {
        if (!events[eventId].tasks) events[eventId].tasks = {};
        Object.assign(events[eventId].tasks, tasksMap);
        events[eventId].updatedAt = now;
        saveLocalEvents(events);
      }
      return;
    }

    // Multi-location or batch set
    await update(ref(database, `events/${eventId}/tasks`), tasksMap);
    await update(ref(database, `events/${eventId}`), { updatedAt: now });
  },
};

