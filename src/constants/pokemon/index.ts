import { kantoPokemon } from './kanto';

export const BASE_POKEMON_IMAGE_URL =
  'https://raw.githubusercontent.com/parthenonlab/assets/main/pokemon';

export const POKEMON_LIST = [...kantoPokemon];

export const POKEMON_RARITY = {
  common: 0.45,
  uncommon: 0.25,
  rare: 0.2,
  'very rare': 0.07,
  legendary: 0.019,
  mythical: 0.011,
};

export const POKEMON_SHINY = {
  normal: 0.999755859375,
  shiny: 0.000244140625, // 1 in 4096 chance
};
