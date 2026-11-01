/**
 * Application Security Utilities
 * Defends against XSS, Path Traversal, and Protocol Injection.
 */

/**
 * Validates that a URL strictly uses safe web protocols (http or https).
 * Defends against JavaScript URI DOM-based XSS (e.g. javascript:alert(1))
 * and data: URI injection.
 */
export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    // If not a full URL or invalid, check relative or regex
    return /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/i.test(trimmed);
  }
}

/**
 * Sanitizes user-uploaded filenames.
 * Strips directory traversal sequences (../, ..\), control characters,
 * and dangerous extension characters.
 */
export function sanitizeFileName(fileName?: string | null, fallback = 'image.jpg'): string {
  if (!fileName || typeof fileName !== 'string') return fallback;

  // 1. Strip path traversal sequences
  let clean = fileName.replace(/(\.\.[\/\\])+/g, '').replace(/[\/\\]/g, '_');

  // 2. Remove null bytes and non-printable control characters
  clean = clean.replace(/[\x00-\x1F\x7F]/g, '');

  // 3. Remove characters that are problematic in filenames or HTML attributes
  clean = clean.replace(/[<>"'`|?*:]/g, '_');

  // 4. Trim leading and trailing periods or spaces
  clean = clean.replace(/^[\s.]+|[\s.]+$/g, '');

  // 5. Enforce maximum length
  if (clean.length > 120) {
    const ext = clean.substring(clean.lastIndexOf('.'));
    clean = clean.substring(0, 110) + ext;
  }

  return clean || fallback;
}

/**
 * Sanitizes phone numbers for use in tel: URIs to prevent protocol tampering
 */
export function sanitizeTelUri(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  // Only allow numbers, +, -, and spaces
  return phone.replace(/[^0-9+\- ]/g, '').trim();
}

/**
 * Sanitizes email addresses for use in mailto: URIs
 */
export function sanitizeMailtoUri(email?: string | null): string {
  if (!email || typeof email !== 'string') return '';
  // Strip control characters and dangerous headers
  const sanitized = email.replace(/[\r\n\x00-\x1F\x7F]/g, '').trim();
  // Basic email pattern check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    return '';
  }
  return sanitized;
}

