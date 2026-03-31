import { formatPriceToCode } from '@/lib/utils';

describe('formatPriceToCode', () => {
  it('wraps a formatted number in backticks', () => {
    expect(formatPriceToCode(1000)).toBe('`1,000`');
  });

  it('formats a small number', () => {
    expect(formatPriceToCode(5)).toBe('`5`');
  });

  it('formats a large number with commas', () => {
    expect(formatPriceToCode(1000000)).toBe('`1,000,000`');
  });

  it('formats zero', () => {
    expect(formatPriceToCode(0)).toBe('`0`');
  });
});
