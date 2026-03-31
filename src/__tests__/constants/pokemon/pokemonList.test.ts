import { POKEMON_LIST } from '@/constants/pokemon';

const VALID_RARITIES = new Set(['common', 'uncommon', 'rare', 'very rare', 'legendary', 'mythical']);
const VALID_SPAWNS = new Set(['day', 'night', 'both']);
const GENDERLESS_RARITIES = new Set(['legendary', 'mythical']);

describe('POKEMON_LIST', () => {
  it('contains 151 Kanto Pokemon', () => {
    expect(POKEMON_LIST).toHaveLength(151);
  });

  it('all IDs are unique', () => {
    const ids = POKEMON_LIST.map(p => p.id);
    expect(new Set(ids).size).toBe(POKEMON_LIST.length);
  });

  it('all IDs are sequential from 1 to 151', () => {
    const ids = POKEMON_LIST.map(p => p.id).sort((a, b) => a - b);
    ids.forEach((id, i) => expect(id).toBe(i + 1));
  });

  it('all slugs are unique', () => {
    const slugs = POKEMON_LIST.map(p => p.slug);
    expect(new Set(slugs).size).toBe(POKEMON_LIST.length);
  });

  it('all rarities are valid', () => {
    POKEMON_LIST.forEach(p => {
      expect(VALID_RARITIES.has(p.rarity)).toBe(true);
    });
  });

  it('all catchRates are in range 0–255', () => {
    POKEMON_LIST.forEach(p => {
      expect(p.catchRate).toBeGreaterThanOrEqual(0);
      expect(p.catchRate).toBeLessThanOrEqual(255);
    });
  });

  it('all activeSpawn values are valid', () => {
    POKEMON_LIST.forEach(p => {
      expect(VALID_SPAWNS.has(p.activeSpawn)).toBe(true);
    });
  });

  it('legendary and mythical Pokemon have null genderRatio', () => {
    POKEMON_LIST.filter(p => GENDERLESS_RARITIES.has(p.rarity)).forEach(p => {
      expect(p.genderRatio).toBeNull();
    });
  });

  it('genderRatio sums to 1 when not null', () => {
    POKEMON_LIST.filter(p => p.genderRatio !== null).forEach(p => {
      const total = p.genderRatio!.male + p.genderRatio!.female;
      expect(total).toBeCloseTo(1, 10);
    });
  });

  it('all Pokemon have at least one type', () => {
    POKEMON_LIST.forEach(p => {
      expect(p.types.length).toBeGreaterThan(0);
    });
  });

  it('all names and slugs are non-empty strings', () => {
    POKEMON_LIST.forEach(p => {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.slug.length).toBeGreaterThan(0);
    });
  });
});
