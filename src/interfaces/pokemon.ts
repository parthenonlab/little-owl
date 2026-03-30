type PokeballType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export type ActiveSpawn = 'day' | 'night' | 'both';

export interface PokeballObject {
  type: PokeballType;
  emoji: string;
  label: string;
  price: number;
}

export type PokemonRarity =
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
  hasFemaleImage: boolean;
  activeSpawn: ActiveSpawn;
  variants: string[];
}

export interface PokemonExplorePayload {
  id: number;
  name: string;
  rarity: PokemonRarity;
  gender: string | null;
  variant: string;
  shiny: boolean;
  pokemonIcon: string;
  authorIcon: string;
}
