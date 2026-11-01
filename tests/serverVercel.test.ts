import { describe, it, expect } from 'vitest';
import app from '../api/index';

describe('Vercel Serverless Function entrypoint (api/index.ts)', () => {
  it('exports an express application instance without binding port', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
  });
});
