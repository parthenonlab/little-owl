import { formatError } from '@/lib/utils';

describe('formatError', () => {
  it('returns the stack for an Error', () => {
    const error = new Error('boom');
    expect(formatError(error)).toBe(error.stack);
  });

  it('returns the message when an Error has no stack', () => {
    const error = new Error('boom');
    error.stack = undefined;
    expect(formatError(error)).toBe('boom');
  });

  it('returns JSON for a plain object', () => {
    expect(formatError({ code: 11000 })).toBe('{"code":11000}');
  });

  it('returns JSON for a string', () => {
    expect(formatError('failed')).toBe('"failed"');
  });

  it('returns "undefined" for undefined', () => {
    expect(formatError(undefined)).toBe('undefined');
  });

  it('truncates long output to 4000 characters', () => {
    expect(formatError('x'.repeat(5000))).toHaveLength(4000);
  });
});
