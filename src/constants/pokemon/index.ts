import { kantoPokemon } from './kanto';

export * from './shop';
export * from './types';
export * from './weights';

export const POKEMON_IMAGE_URLS = {
  base: 'https://raw.githubusercontent.com/parthenonlab/assets/main',
  pokemondb: 'https://img.pokemondb.net/sprites/go',
};

export const POKEMON_LIST = [...kantoPokemon];
