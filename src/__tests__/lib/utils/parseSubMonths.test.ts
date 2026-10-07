import { parseSubMonths } from '@/lib/utils';

describe('parseSubMonths', () => {
  it('returns the number for a numeric string', () => {
    expect(parseSubMonths('14')).toBe(14);
  });

  it('returns the number for a number', () => {
    expect(parseSubMonths(6)).toBe(6);
  });

  it('returns 1 for true (TMI.js converts "1" to true)', () => {
    expect(parseSubMonths(true)).toBe(1);
  });

  it('returns 0 for false (TMI.js converts "0" to false)', () => {
    expect(parseSubMonths(false)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(parseSubMonths(undefined)).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(parseSubMonths(null)).toBe(0);
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
