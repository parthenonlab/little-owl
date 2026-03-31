import { isNumber } from '@/lib/utils';

describe('isNumber', () => {
  it('returns true for a positive integer string', () => {
    expect(isNumber('42')).toBe(true);
  });

  it('returns true for a negative integer string', () => {
    expect(isNumber('-10')).toBe(true);
  });

  it('returns true for zero', () => {
    expect(isNumber('0')).toBe(true);
  });

  it('returns false for a float string', () => {
    expect(isNumber('3.14')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isNumber('')).toBe(false);
  });

  it('returns false for alphabetic input', () => {
    expect(isNumber('abc')).toBe(false);
  });

  it('returns false for alphanumeric input', () => {
    expect(isNumber('12abc')).toBe(false);
  });

  it('returns false for a string with spaces', () => {
    expect(isNumber('1 2')).toBe(false);
  });
});
