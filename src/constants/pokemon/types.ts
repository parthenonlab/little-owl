type ActiveSpawn = 'day' | 'night' | 'both';

type PokemonRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very rare'
  | 'legendary'
  | 'mythical';

export interface PokemonObject {
  id: number;
  name: string;
  slug: string;
  types: string[];
  rarity: PokemonRarity;
  catchRate: number;
  genderRatio: {
    male: number;
    female: number;
  } | null;
  activeSpawn: ActiveSpawn;
  variants: string[];
}
