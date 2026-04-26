import { POKEBALLS } from '@/constants/pokemon';

const BALL_TYPES = [
  'pokeball',
  'greatball',
  'ultraball',
  'masterball',
] as const;

describe('POKEBALLS', () => {
  it('contains all 4 ball types in order', () => {
    expect(POKEBALLS.map(b => b.type)).toEqual(BALL_TYPES);
  });

  it('prices are in ascending order', () => {
    const prices = POKEBALLS.map(b => b.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it('multipliers are in ascending order', () => {
    const multipliers = POKEBALLS.map(b => b.multiplier);
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeGreaterThan(multipliers[i - 1]);
    }
  });

  it('masterball has Infinity multiplier', () => {
    const masterball = POKEBALLS.find(b => b.type === 'masterball');
    expect(masterball?.multiplier).toBe(Infinity);
  });

  it('all balls have a non-empty label and emoji', () => {
    POKEBALLS.forEach(b => {
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
    });
  });

  it('all prices are positive', () => {
    POKEBALLS.forEach(b => expect(b.price).toBeGreaterThan(0));
  });
});
