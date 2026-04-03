import { getUpgradePrice } from '@/discord/helpers';

describe('getUpgradePrice', () => {
  it('returns 500 for capacity below 10', () => {
    expect(getUpgradePrice(5)).toBe(500);
    expect(getUpgradePrice(9)).toBe(500);
  });

  it('returns 750 for capacity 10–14', () => {
    expect(getUpgradePrice(10)).toBe(750);
    expect(getUpgradePrice(14)).toBe(750);
  });

  it('returns 1000 for capacity 15–19', () => {
    expect(getUpgradePrice(15)).toBe(1000);
    expect(getUpgradePrice(19)).toBe(1000);
  });

  it('returns 1250 for capacity 20–24', () => {
    expect(getUpgradePrice(20)).toBe(1250);
    expect(getUpgradePrice(24)).toBe(1250);
  });

  it('returns 1500 for capacity 25–29', () => {
    expect(getUpgradePrice(25)).toBe(1500);
    expect(getUpgradePrice(29)).toBe(1500);
  });

  it('returns 0 for capacity 30 (max tier)', () => {
    expect(getUpgradePrice(30)).toBe(0);
  });

  it('returns 0 for capacity above 30', () => {
    expect(getUpgradePrice(50)).toBe(0);
  });
});
