import { weightedRandom } from '@/lib/utils';

describe('weightedRandom', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the only key when one weight is 100%', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(weightedRandom({ only: 1 })).toBe('only');
  });

  it('returns the first key when random is at the low end', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(weightedRandom({ a: 0.5, b: 0.5 })).toBe('a');
  });

  it('returns the second key when random is at the high end', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(weightedRandom({ a: 0.5, b: 0.5 })).toBe('b');
  });

  it('respects weight proportions', () => {
    // With weights {rare: 0.1, common: 0.9}, r=0.05 should hit 'rare'
    jest.spyOn(Math, 'random').mockReturnValue(0.05);
    expect(weightedRandom({ rare: 0.1, common: 0.9 })).toBe('rare');
  });

  it('throws on an empty object', () => {
    expect(() => weightedRandom({})).toThrow();
  });

  it('throws when all weights are zero', () => {
    expect(() => weightedRandom({ a: 0, b: 0 })).toThrow();
  });

  it('throws on negative weights', () => {
    expect(() => weightedRandom({ a: -1, b: 1 })).toThrow();
  });

  it('throws on NaN weights', () => {
    expect(() => weightedRandom({ a: NaN })).toThrow();
  });
});
