import { capitalize } from '@/lib/utils';

describe('capitalize', () => {
  it('capitalizes a single word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('capitalizes every word in a multi-word string', () => {
    expect(capitalize('hello world')).toBe('Hello World');
  });

  it('returns an empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles already-capitalized input', () => {
    expect(capitalize('Hello World')).toBe('Hello World');
  });

  it('handles all-uppercase input', () => {
    expect(capitalize('HELLO')).toBe('HELLO');
  });

  it('handles extra spaces between words', () => {
    expect(capitalize('hello  world')).toBe('Hello  World');
  });

  it('handles a single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});
