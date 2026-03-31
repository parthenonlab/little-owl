import { formatPriceToString } from '@/lib/utils';

describe('formatPriceToString', () => {
  it('formats a number with commas', () => {
    expect(formatPriceToString(1000)).toBe('1,000');
  });

  it('formats a small number', () => {
    expect(formatPriceToString(5)).toBe('5');
  });

  it('formats a large number', () => {
    expect(formatPriceToString(1000000)).toBe('1,000,000');
  });

  it('formats zero', () => {
    expect(formatPriceToString(0)).toBe('0');
  });
});
