import { parseSubMonths } from '@/lib/utils';

describe('parseSubMonths', () => {
  it('returns the number for a numeric string', () => {
    expect(parseSubMonths('14')).toBe(14);
  });

  it('returns 1 for a first-month subscriber', () => {
    expect(parseSubMonths('1')).toBe(1);
  });

  it('returns 0 for undefined', () => {
    expect(parseSubMonths(undefined)).toBe(0);
  });

  it('returns 0 for null (no subscriber badge)', () => {
    expect(parseSubMonths(null)).toBe(0);
  });

  it('returns 0 for an empty string', () => {
    expect(parseSubMonths('')).toBe(0);
  });

  it('returns 0 for a negative number', () => {
    expect(parseSubMonths('-3')).toBe(0);
  });

  it('returns 0 for a float', () => {
    expect(parseSubMonths('2.5')).toBe(0);
  });

  it('returns 0 for a non-numeric string', () => {
    expect(parseSubMonths('abc')).toBe(0);
  });
});
