import { getCurrency } from '@/lib/utils';

describe('getCurrency', () => {
  it('returns the plural form for values greater than 1', () => {
    expect(getCurrency(2)).toBe('silver coins');
  });

  it('returns the plural form for large values', () => {
    expect(getCurrency(1000)).toBe('silver coins');
  });

  it('returns the singular form for 1', () => {
    expect(getCurrency(1)).toBe('silver coin');
  });

  it('returns the singular form for 0', () => {
    expect(getCurrency(0)).toBe('silver coin');
  });

  it('returns the singular form for negative values', () => {
    expect(getCurrency(-5)).toBe('silver coin');
  });
});
