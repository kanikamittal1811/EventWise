import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, getDaysUntil, formatBytes } from '../src/utils/formatters';

describe('Formatters Unit Tests', () => {
  describe('formatCurrency', () => {
    it('formats Indian Rupee (INR) amounts correctly with currency symbol', () => {
      const formatted = formatCurrency(150000, 'INR');
      expect(formatted).toContain('1,50,000');
    });

    it('formats US Dollar (USD) amounts correctly', () => {
      const formatted = formatCurrency(25000, 'USD');
      expect(formatted).toContain('25,000');
      expect(formatted).toContain('$');
    });

    it('formats Euro (EUR) amounts correctly', () => {
      const formatted = formatCurrency(4000, 'EUR');
      expect(formatted).toContain('4,000');
    });

    it('handles zero and negative amounts without crashing', () => {
      expect(formatCurrency(0, 'INR')).toContain('0');
      expect(formatCurrency(-5000, 'USD')).toContain('-');
    });

    it('defaults to INR when currency is not supplied', () => {
      const formatted = formatCurrency(50000);
      expect(formatted).toContain('50,000');
    });
  });

  describe('formatDate', () => {
    it('returns "Date not set" when date is undefined or empty', () => {
      expect(formatDate(undefined)).toBe('Date not set');
      expect(formatDate('')).toBe('Date not set');
    });

    it('formats valid ISO date strings to human-readable month-day-year', () => {
      const formatted = formatDate('2026-11-15T00:00:00.000Z');
      expect(formatted).toMatch(/Nov 15, 2026|15 Nov 2026/);
    });

    it('returns original string if date string is unparseable', () => {
      expect(formatDate('invalid-date-string')).toBe('invalid-date-string');
    });
  });

  describe('getDaysUntil', () => {
    it('returns "No date" when string is empty', () => {
      const res = getDaysUntil('');
      expect(res.label).toBe('No date');
      expect(res.days).toBe(0);
    });

    it('identifies future event dates and formats countdown label', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const res = getDaysUntil(futureDate.toISOString());

      expect(res.isPast).toBe(false);
      expect(res.days).toBe(10);
      expect(res.label).toBe('10 days to go');
    });

    it('identifies tomorrow as a special countdown label', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const res = getDaysUntil(tomorrow.toISOString());

      expect(res.isPast).toBe(false);
      expect(res.days).toBe(1);
      expect(res.label).toBe('Tomorrow');
    });

    it('identifies today as "Today!"', () => {
      const today = new Date();
      const res = getDaysUntil(today.toISOString());

      expect(res.isPast).toBe(false);
      expect(res.days).toBe(0);
      expect(res.label).toBe('Today!');
    });

    it('identifies past dates and marks isPast as true', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const res = getDaysUntil(past.toISOString());

      expect(res.isPast).toBe(true);
      expect(res.days).toBe(5);
      expect(res.label).toBe('5 days ago');
    });
  });

  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes below 1 KB', () => {
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats Kilobytes (KB)', () => {
      expect(formatBytes(2048)).toBe('2 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('formats Megabytes (MB)', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
    });

    it('formats Gigabytes (GB)', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });
});

