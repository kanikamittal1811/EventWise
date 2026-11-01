import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from './testStorage';
import { AuthService } from '../src/services/firebase/authService';

describe('AuthService Unit Tests (Demo & Fallback Mode)', () => {
  beforeEach(() => {
    const storage = setupLocalStorageMock();
    storage.clear();
  });

  it('signs up a user in offline/demo mode and saves profile', async () => {
    const profile = await AuthService.signUp(
      'sarah.wedding@eventwise.app',
      'password123',
      'Sarah Jenkins'
    );

    expect(profile.uid).toMatch(/^demo_/);
    expect(profile.email).toBe('sarah.wedding@eventwise.app');
    expect(profile.displayName).toBe('Sarah Jenkins');
    expect(profile.preferences?.defaultCurrency).toBe('INR');

    // Should be persisted in local storage
    const stored = JSON.parse(localStorage.getItem('eventwise_demo_user') || '{}');
    expect(stored.email).toBe('sarah.wedding@eventwise.app');
  });

  it('logs in an existing demo user', async () => {
    // First sign up
    await AuthService.signUp('vikram@example.com', 'secret', 'Vikram Malhotra');

    // Now log in
    const loggedIn = await AuthService.login('vikram@example.com', 'secret');
    expect(loggedIn.displayName).toBe('Vikram Malhotra');
    expect(loggedIn.email).toBe('vikram@example.com');
  });

  it('logs in with new credentials in demo mode using fallback generator', async () => {
    const profile = await AuthService.login('neha.sharma@domain.com', 'anypass');
    expect(profile.displayName).toBe('neha.sharma');
    expect(profile.email).toBe('neha.sharma@domain.com');
  });

  it('signs in with demo Google profile', async () => {
    const profile = await AuthService.signInWithGoogle();
    expect(profile.uid).toBe('demo_google_user');
    expect(profile.email).toBe('alex.planner@gmail.com');
    expect(profile.displayName).toBe('Alex Planner');
  });

  it('signs in directly using signInAsDemoUser', async () => {
    const profile = await AuthService.signInAsDemoUser('custom.demo@eventwise.app', 'Custom Planner');
    expect(profile.uid).toBe('demo_google_user');
    expect(profile.email).toBe('custom.demo@eventwise.app');
    expect(profile.displayName).toBe('Custom Planner');
  });

  it('logs out and removes user profile from storage', async () => {
    await AuthService.signUp('temp@example.com', 'pass', 'Temp User');
    expect(localStorage.getItem('eventwise_demo_user')).not.toBeNull();

    await AuthService.logout();
    expect(localStorage.getItem('eventwise_demo_user')).toBeNull();
  });

  it('notifies observer on auth change', async () => {
    let capturedUser: any = undefined;
    AuthService.onAuthChanged((user) => {
      capturedUser = user;
    });

    expect(capturedUser).toBeNull();

    await AuthService.signUp('observer@example.com', 'pass', 'Observer User');
    AuthService.onAuthChanged((user) => {
      capturedUser = user;
    });

    expect(capturedUser).not.toBeNull();
    expect(capturedUser.email).toBe('observer@example.com');
  });
});

