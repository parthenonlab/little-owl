import { formatNumberToCode } from '@/lib/utils';

describe('formatNumberToCode', () => {
  it('wraps a formatted number in backticks', () => {
    expect(formatNumberToCode(1000)).toBe('`1,000`');
  });

  it('formats a small number', () => {
    expect(formatNumberToCode(5)).toBe('`5`');
  });

  it('formats a large number with commas', () => {
    expect(formatNumberToCode(1000000)).toBe('`1,000,000`');
  });

  it('formats zero', () => {
    expect(formatNumberToCode(0)).toBe('`0`');
  });
});
