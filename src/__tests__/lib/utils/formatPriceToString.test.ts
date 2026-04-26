import { formatNumberToString } from '@/lib/utils';

describe('formatNumberToString', () => {
  it('formats a number with commas', () => {
    expect(formatNumberToString(1000)).toBe('1,000');
  });

  it('formats a small number', () => {
    expect(formatNumberToString(5)).toBe('5');
  });

  it('formats a large number', () => {
    expect(formatNumberToString(1000000)).toBe('1,000,000');
  });

  it('formats zero', () => {
    expect(formatNumberToString(0)).toBe('0');
  });
});
