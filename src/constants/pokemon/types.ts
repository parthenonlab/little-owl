type ActiveSpawn = 'day' | 'night' | 'both';

type PokemonRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very rare'
  | 'legendary'
  | 'mythical';

export type BallType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

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
  hasFemaleImage: boolean;
  activeSpawn: ActiveSpawn;
  variants: string[];
}
