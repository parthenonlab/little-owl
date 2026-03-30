type ActiveSpawn = 'day' | 'night' | 'both';

type PokemonRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very rare'
  | 'legendary'
  | 'mythical';

type BallType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export interface PokeballObject {
  type: BallType;
  emoji: string;
  label: string;
  price: number;
}

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
