import { describe, it, expect } from 'vitest';
import {
  isSafeHttpUrl,
  sanitizeFileName,
  sanitizeTelUri,
  sanitizeMailtoUri,
} from '../src/utils/security';
import { vendorSchema } from '../src/schemas/vendor.schema';

describe('Security & Vulnerability Remediation Suite', () => {
  describe('Safe URL Validation (DOM XSS & Protocol Injection Prevention)', () => {
    it('accepts valid http and https URLs', () => {
      expect(isSafeHttpUrl('https://example.com')).toBe(true);
      expect(isSafeHttpUrl('http://vendors.eventwise.app/caterer')).toBe(true);
      expect(isSafeHttpUrl('https://sub.domain.co.in/path?query=1&arg=test')).toBe(true);
    });

    it('rejects malicious javascript: URIs (preventing DOM XSS)', () => {
      expect(isSafeHttpUrl('javascript:alert(document.cookie)')).toBe(false);
      expect(isSafeHttpUrl('javascript:eval("malicious")')).toBe(false);
      expect(isSafeHttpUrl('JAVASCRIPT:alert(1)')).toBe(false);
    });

    it('rejects data: URIs and file: protocols', () => {
      expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeHttpUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeHttpUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('rejects empty, null, or whitespace-only inputs', () => {
      expect(isSafeHttpUrl('')).toBe(false);
      expect(isSafeHttpUrl('   ')).toBe(false);
      expect(isSafeHttpUrl(null)).toBe(false);
      expect(isSafeHttpUrl(undefined)).toBe(false);
    });
  });

  describe('Filename Sanitization (Path Traversal & Injection Prevention)', () => {
    it('strips directory traversal sequences like ../ and ..\\', () => {
      expect(sanitizeFileName('../../etc/passwd.jpg')).toBe('etc_passwd.jpg');
      expect(sanitizeFileName('..\\..\\windows\\system32.png')).toBe('windows_system32.png');
      expect(sanitizeFileName('../../../var/log/app.webp')).toBe('var_log_app.webp');
    });

    it('strips null bytes and control characters', () => {
      expect(sanitizeFileName('exploit\x00.jpg')).toBe('exploit.jpg');
      expect(sanitizeFileName('file\x1F\x7Fname.png')).toBe('filename.png');
    });

    it('strips HTML and script characters from filenames', () => {
      expect(sanitizeFileName('<script>alert(1)</script>.png')).toBe('_script_alert(1)__script_.png');
      expect(sanitizeFileName('photo"onload="alert(1).jpg')).toBe('photo_onload=_alert(1).jpg');
    });

    it('provides safe fallback for null or empty filenames', () => {
      expect(sanitizeFileName('')).toBe('image.jpg');
      expect(sanitizeFileName(null)).toBe('image.jpg');
    });
  });

  describe('URI Scheme Sanitization (Tel and Mailto)', () => {
    it('sanitizes telephone strings to numbers and basic formatting only', () => {
      expect(sanitizeTelUri('+91 98765-43210')).toBe('+91 98765-43210');
      expect(sanitizeTelUri('+1 (555) 019-2834<script>')).toBe('+1 555 019-2834');
      expect(sanitizeTelUri('')).toBe('');
      expect(sanitizeTelUri(null)).toBe('');
    });

    it('prevents CRLF header injection in email links', () => {
      expect(sanitizeMailtoUri('valid@example.com')).toBe('valid@example.com');
      // Strips CRLF headers that could inject Bcc or subject lines
      expect(sanitizeMailtoUri('victim@example.com\r\nBcc:attacker@evil.com')).toBe('');
      expect(sanitizeMailtoUri('invalid-email-format')).toBe('');
      expect(sanitizeMailtoUri(null)).toBe('');
    });
  });

  describe('Vendor Schema URL Validation', () => {
    it('accepts legitimate vendor website URLs', () => {
      const valid = {
        name: 'Grand Floral Decor',
        category: 'decoration',
        quotation: 100000,
        negotiatedPrice: 90000,
        bookingStatus: 'booked',
        paymentStatus: 'deposit_paid',
        website: 'https://grandfloral.com',
      };
      expect(vendorSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects javascript: or data: URIs in vendor website field', () => {
      const malicious = {
        name: 'Evil Vendor',
        category: 'venue',
        quotation: 50000,
        negotiatedPrice: 50000,
        bookingStatus: 'inquired',
        paymentStatus: 'unpaid',
        website: 'javascript:alert(1)',
      };
      expect(vendorSchema.safeParse(malicious).success).toBe(false);

      const dataUri = {
        ...malicious,
        website: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      };
      expect(vendorSchema.safeParse(dataUri).success).toBe(false);
    });
  });
});

