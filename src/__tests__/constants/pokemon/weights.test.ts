import {
  POKEMON_RARITY_WEIGHTS,
  POKEMON_SHINY_WEIGHTS,
  POKEMON_SHINY_CHARM_WEIGHTS,
} from '@/constants/pokemon';

const sum = (weights: Record<string, number>) =>
  Object.values(weights).reduce((acc, v) => acc + v, 0);

describe('POKEMON_RARITY_WEIGHTS', () => {
  it('contains all rarity tiers', () => {
    const keys = Object.keys(POKEMON_RARITY_WEIGHTS);
    expect(keys).toEqual(
      expect.arrayContaining([
        'common',
        'uncommon',
        'rare',
        'very rare',
        'legendary',
        'mythical',
      ]),
    );
    expect(keys).toHaveLength(6);
  });

  it('weights sum to 1', () => {
    expect(sum(POKEMON_RARITY_WEIGHTS)).toBeCloseTo(1, 10);
  });

  it('all weights are positive', () => {
    Object.values(POKEMON_RARITY_WEIGHTS).forEach(w =>
      expect(w).toBeGreaterThan(0),
    );
  });
});

describe('POKEMON_SHINY_WEIGHTS', () => {
  it('contains normal and shiny keys', () => {
    expect(Object.keys(POKEMON_SHINY_WEIGHTS)).toEqual(
      expect.arrayContaining(['normal', 'shiny']),
    );
  });

  it('weights sum to 1', () => {
    expect(sum(POKEMON_SHINY_WEIGHTS)).toBeCloseTo(1, 10);
  });

  it('shiny chance is approximately 1 in 1024', () => {
    expect(POKEMON_SHINY_WEIGHTS.shiny).toBeCloseTo(1 / 1024, 10);
  });
});

describe('POKEMON_SHINY_CHARM_WEIGHTS', () => {
  it('weights sum to 1', () => {
    expect(sum(POKEMON_SHINY_CHARM_WEIGHTS)).toBeCloseTo(1, 10);
  });

  it('shiny charm rate is higher than base shiny rate', () => {
    expect(POKEMON_SHINY_CHARM_WEIGHTS.shiny).toBeGreaterThan(
      POKEMON_SHINY_WEIGHTS.shiny,
    );
  });

  it('shiny chance is approximately 1 in 512', () => {
    expect(POKEMON_SHINY_CHARM_WEIGHTS.shiny).toBeCloseTo(1 / 512, 10);
  });
});
