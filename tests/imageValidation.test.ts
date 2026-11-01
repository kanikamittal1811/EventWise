import { describe, it, expect } from 'vitest';
import {
  validateImageMimeType,
  calculateBase64SizeBytes,
  MAX_ENCODED_SIZE_BYTES,
} from '../src/utils/imageCompressor';
import { ImageStorageService } from '../src/services/image/imageStorageService';

describe('Strict Image Upload & Storage Architecture Validation', () => {
  it('strictly validates supported image MIME types (JPEG, PNG, WebP)', () => {
    expect(validateImageMimeType('image/jpeg')).toBe(true);
    expect(validateImageMimeType('image/png')).toBe(true);
    expect(validateImageMimeType('image/webp')).toBe(true);

    // Unsupported formats must be rejected
    expect(validateImageMimeType('application/pdf')).toBe(false);
    expect(validateImageMimeType('image/gif')).toBe(false);
    expect(validateImageMimeType('image/svg+xml')).toBe(false);
    expect(validateImageMimeType('text/plain')).toBe(false);
  });

  it('correctly checks Base64 encoded size against 1 MB (1,048,576 bytes) ceiling', () => {
    expect(MAX_ENCODED_SIZE_BYTES).toBe(1048576);

    // Small data URL (e.g. 500 KB)
    const smallPayload = 'data:image/jpeg;base64,' + 'A'.repeat(500 * 1024);
    const smallValidation = ImageStorageService.encodeImage(smallPayload);
    expect(smallValidation.isValid).toBe(true);
    expect(smallValidation.sizeBytes).toBeLessThan(MAX_ENCODED_SIZE_BYTES);

    // Oversized data URL (e.g. 1.5 MB)
    const largePayload = 'data:image/jpeg;base64,' + 'A'.repeat(1500 * 1024);
    const largeValidation = ImageStorageService.encodeImage(largePayload);
    expect(largeValidation.isValid).toBe(false);
    expect(largeValidation.sizeBytes).toBeGreaterThan(MAX_ENCODED_SIZE_BYTES);
  });

  it('validates ImageStorageService abstraction interface methods exist', () => {
    expect(typeof ImageStorageService.validateImage).toBe('function');
    expect(typeof ImageStorageService.compressImage).toBe('function');
    expect(typeof ImageStorageService.encodeImage).toBe('function');
    expect(typeof ImageStorageService.saveImage).toBe('function');
    expect(typeof ImageStorageService.getImage).toBe('function');
    expect(typeof ImageStorageService.getImageMetadata).toBe('function');
    expect(typeof ImageStorageService.deleteImage).toBe('function');
  });
});

