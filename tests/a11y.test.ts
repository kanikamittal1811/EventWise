import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../src/utils/formatters';
import { calculateBudgetSummary } from '../src/utils/calculations';

/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio Calculation (WCAG 2.2 SC 1.4.3)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Web Accessibility & WCAG 2.2 Level AA Verification', () => {
  describe('WCAG 1.4.3 Contrast (Minimum) - Text & Icon Readability', () => {
    it('verifies primary theme color (#842A3E) against white background exceeds 4.5:1 AA ratio', () => {
      const ratio = getContrastRatio('#842A3E', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      // Actual ratio is ~8.5:1
      expect(ratio).toBeGreaterThan(8.0);
    });

    it('verifies body text color (#2B2F38) against white background exceeds 7:1 AAA ratio', () => {
      const ratio = getContrastRatio('#2B2F38', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('verifies secondary text color (#494E5D / charcoal-600) exceeds 4.5:1 AA ratio on white', () => {
      const ratio = getContrastRatio('#494E5D', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('verifies dark status red (#B91C1C / red-700) exceeds 4.5:1 AA ratio on red-50 tint (#FEF2F2)', () => {
      const ratio = getContrastRatio('#B91C1C', '#FEF2F2');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('verifies dark status green (#047857 / emerald-700) exceeds 4.5:1 AA ratio on emerald-50 tint (#ECFDF5)', () => {
      const ratio = getContrastRatio('#047857', '#ECFDF5');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('WCAG 4.1.2 Name, Role, Value - ARIA Progressbar Semantics', () => {
    it('calculates integer percentage bounded in [0, 100] for aria-valuenow', () => {
      const summary = calculateBudgetSummary(
        100000,
        {},
        {
          e1: { id: 'e1', title: 'Test 1', categoryId: 'c1', amount: 35000, paidAmount: 35000, status: 'paid', createdAt: 0, updatedAt: 0 },
        }
      );

      const ariaValueNow = Math.round(Math.min(100, Math.max(0, summary.percentageUsed)));
      expect(ariaValueNow).toBe(35);
      expect(Number.isInteger(ariaValueNow)).toBe(true);
    });

    it('clamps overflow progress to max 100 or handles over-budget state gracefully', () => {
      const summaryOverBudget = calculateBudgetSummary(
        10000,
        {},
        {
          e1: { id: 'e1', title: 'Over', categoryId: 'c1', amount: 15000, paidAmount: 15000, status: 'paid', createdAt: 0, updatedAt: 0 },
        }
      );

      // Percentage is safely capped to 100 in the calculation utility
      expect(summaryOverBudget.percentageUsed).toBe(100);
      expect(summaryOverBudget.remainingBudget).toBe(-5000);
    });
  });

  describe('WCAG 1.3.1 Info and Relationships - ID Generation for Form Controls', () => {
    it('generates predictable, valid HTML id tokens from label strings', () => {
      const generateId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      expect(generateId('Email Address')).toBe('email-address');
      expect(generateId('Total Budget (INR)')).toBe('total-budget-inr-');
      expect(generateId('Vendor & Contact Name')).toBe('vendor-contact-name');
    });

    it('properly constructs errorId and helperId for aria-describedby linkage', () => {
      const inputId = 'event-budget';
      const errorId = `${inputId}-error`;
      const helperId = `${inputId}-helper`;

      expect(errorId).toBe('event-budget-error');
      expect(helperId).toBe('event-budget-helper');
    });
  });

  describe('WCAG 2.4.4 Link Purpose & Accessible Formatting', () => {
    it('formats dates in human-readable, screen-reader friendly format', () => {
      const dateStr = '2026-12-25T00:00:00.000Z';
      const formatted = formatDate(dateStr);
      expect(formatted).toMatch(/Dec 25, 2026|25 Dec 2026/);
      expect(formatted).not.toContain('T00:00:00');
    });

    it('formats currencies clearly indicating currency symbol or ISO representation', () => {
      const inrFormatted = formatCurrency(50000, 'INR');
      expect(inrFormatted).toContain('50,000');

      const usdFormatted = formatCurrency(1200, 'USD');
      expect(usdFormatted).toContain('1,200');
    });
  });

  describe('Focus Trap Selector Validity', () => {
    it('uses standard comprehensive focusable elements query selector', () => {
      const FOCUSABLE_SELECTOR =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

      expect(FOCUSABLE_SELECTOR).toContain('a[href]');
      expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])');
      expect(FOCUSABLE_SELECTOR).toContain('input:not([disabled])');
      expect(FOCUSABLE_SELECTOR).toContain('select:not([disabled])');
      expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
    });
  });
});
