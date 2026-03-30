import { kantoPokemon } from './kanto';

export const POKEMON_IMAGE_URLS = {
  base: 'https://raw.githubusercontent.com/parthenonlab/assets/main',
  pokemondb: 'https://img.pokemondb.net/sprites/go',
};

export const POKEMON_LIST = [...kantoPokemon];

export const POKEMON_RARITY_WEIGHTS: Record<string, number> = {
  common: 0.45,
  uncommon: 0.25,
  rare: 0.2,
  'very rare': 0.07,
  legendary: 0.019,
  mythical: 0.011,
};

export const POKEMON_SHINY_WEIGHTS: Record<string, number> = {
  normal: 0.999755859375,
  shiny: 0.000244140625, // 1 in 4096 chance
};

export const POKEMON_SHINY_CHARM_WEIGHTS: Record<string, number> = {
  normal: 0.999267399267399,
  shiny: 0.000732600732601, // 1 in 1365 chance
};
