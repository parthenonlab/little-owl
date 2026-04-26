type PokeballType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export type ActiveSpawn = 'day' | 'night' | 'both';

export type PokemonType =
  | 'bug'
  | 'dark'
  | 'dragon'
  | 'electric'
  | 'fairy'
  | 'fighting'
  | 'fire'
  | 'flying'
  | 'ghost'
  | 'grass'
  | 'ground'
  | 'ice'
  | 'normal'
  | 'poison'
  | 'psychic'
  | 'rock'
  | 'steel'
  | 'water';

export interface PokeballObject {
  type: PokeballType;
  emoji: string;
  label: string;
  price: number;
  multiplier: number;
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
  types: PokemonType[];
  rarity: PokemonRarity;
  catchRate: number;
  genderRatio: {
    male: number;
    female: number;
  } | null;
  hasFemaleImage: boolean;
  activeSpawn: ActiveSpawn;
  variants?: string[];
}

export interface PokemonExplorePayload {
  id: number;
  name: string;
  rarity: PokemonRarity;
  catchRate: number;
  attempts: number;
  types: PokemonType[];
  gender: string | null;
  variant: string;
  shiny: boolean;
  pokemonImage: string;
  pokemonIcon: string;
  authorIcon: string;
}
