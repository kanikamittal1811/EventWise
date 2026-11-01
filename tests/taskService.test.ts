import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { EventService } from '../src/services/event/eventService';
import { TaskService } from '../src/services/task/taskService';

describe('TaskService Unit Tests (Offline / Local Mode)', () => {
  let eventId: string;

  beforeEach(async () => {
    const storage = setupLocalStorageMock();
    storage.clear();

    eventId = await EventService.createEvent(
      'user_123',
      {
        name: 'Product Launch Showcase',
        category: 'corporate',
        location: 'Hyderabad',
        eventDate: '2027-03-30',
        guestCount: 200,
        totalBudget: 1500000,
        currency: 'INR',
      },
      false
    );
  });

  it('adds a task with category, priority, and dueDate', async () => {
    const taskId = await TaskService.addTask(eventId, {
      title: 'Finalize Keynote Slide Deck',
      description: 'Review product demo videos and hardware setup',
      category: 'Stage & Content',
      priority: 'high',
      status: 'todo',
      dueDate: '2027-03-25',
      assigneeName: 'Priya Verma',
    });

    expect(taskId).toMatch(/^tsk_/);
    const event = await EventService.getEvent(eventId);
    const task = event?.tasks?.[taskId];

    expect(task).toBeDefined();
    expect(task?.title).toBe('Finalize Keynote Slide Deck');
    expect(task?.priority).toBe('high');
    expect(task?.status).toBe('todo');
    expect(task?.dueDate).toBe('2027-03-25');
    expect(task?.assigneeName).toBe('Priya Verma');
  });

  it('toggles task status and properly sets and clears completedAt timestamp', async () => {
    const taskId = await TaskService.addTask(eventId, {
      title: 'Order Custom Badges',
      priority: 'medium',
      status: 'todo',
      dueDate: '2027-03-15',
    });

    // Toggle from todo to completed
    const newStatus1 = await TaskService.toggleTaskStatus(eventId, taskId, 'todo');
    expect(newStatus1).toBe('completed');

    let event = await EventService.getEvent(eventId);
    let task = event?.tasks?.[taskId];
    expect(task?.status).toBe('completed');
    expect(task?.completedAt).toBeDefined();

    // Toggle from completed back to todo
    const newStatus2 = await TaskService.toggleTaskStatus(eventId, taskId, 'completed');
    expect(newStatus2).toBe('todo');

    event = await EventService.getEvent(eventId);
    task = event?.tasks?.[taskId];
    expect(task?.status).toBe('todo');
    expect(task?.completedAt).toBeUndefined();
  });

  it('updates task assignee and priority', async () => {
    const taskId = await TaskService.addTask(eventId, {
      title: 'Setup Audio System',
      priority: 'low',
      status: 'todo',
      dueDate: '2027-03-29',
    });

    await TaskService.updateTask(eventId, taskId, {
      priority: 'urgent',
      assigneeName: 'Sound Lead Rahul',
      assigneeEmail: 'rahul@sounds.com',
    });

    const event = await EventService.getEvent(eventId);
    const task = event?.tasks?.[taskId];
    expect(task?.priority).toBe('urgent');
    expect(task?.assigneeName).toBe('Sound Lead Rahul');
    expect(task?.assigneeEmail).toBe('rahul@sounds.com');
  });

  it('batch adds multiple tasks from AI generator', async () => {
    const tasksToAdd = [
      { title: 'Confirm Keynote Guest Arrival', priority: 'high' as const, dueDate: '2027-03-28' },
      { title: 'Test Livestream Feed', priority: 'urgent' as const, dueDate: '2027-03-29' },
      { title: 'Distribute Press Releases', priority: 'medium' as const, dueDate: '2027-03-30' },
    ];

    await TaskService.batchAddTasks(eventId, tasksToAdd);

    const event = await EventService.getEvent(eventId);
    const tasks = Object.values(event?.tasks || {});
    expect(tasks.length).toBe(3);

    const livestreamTask = tasks.find((t) => t.title === 'Test Livestream Feed');
    expect(livestreamTask).toBeDefined();
    expect(livestreamTask?.priority).toBe('urgent');
    expect(livestreamTask?.status).toBe('todo');
  });

  it('deletes a task', async () => {
    const taskId = await TaskService.addTask(eventId, {
      title: 'Temporary Task to Remove',
      priority: 'low',
      status: 'todo',
      dueDate: '2027-03-10',
    });

    let event = await EventService.getEvent(eventId);
    expect(event?.tasks?.[taskId]).toBeDefined();

    await TaskService.deleteTask(eventId, taskId);
    event = await EventService.getEvent(eventId);
    expect(event?.tasks?.[taskId]).toBeUndefined();
  });
});

