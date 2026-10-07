import { truncateAtWord } from '@/lib/utils/truncateAtWord';

describe('truncateAtWord', () => {
  it('returns text unchanged when within the limit', () => {
    expect(truncateAtWord('hello world', 11)).toBe('hello world');
  });

  it('cuts at the last whitespace instead of mid-word', () => {
    expect(truncateAtWord('hello https://fixvx.com/a/status/1', 20)).toBe(
      'hello…',
    );
  });

  it('never exceeds the max length', () => {
    const result = truncateAtWord('one two three four five six', 15);
    expect(result).toBe('one two three…');
    expect(result.length).toBeLessThanOrEqual(15);
  });

  it('hard cuts when there is no whitespace', () => {
    expect(truncateAtWord('abcdefghij', 5)).toBe('abcd…');
  });
});
