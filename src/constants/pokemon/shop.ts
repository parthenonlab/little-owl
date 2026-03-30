import { PokeballObject } from '@/interfaces/pokemon';
import { ShopState } from '@/interfaces/shop';

import { EMOJIS } from '../emojis';

export const DEFAULT_SHOP_STATE: ShopState = {
  pokeball: 250,
  greatball: 100,
  ultraball: 50,
  masterball: 1,
  lastDailyRestock: new Date(),
  lastWeeklyRestock: new Date(),
};

export const POKEBALLS: PokeballObject[] = [
  {
    type: 'pokeball',
    emoji: EMOJIS.POKEMON.POKEBALL,
    label: 'Poké Balls',
    price: 200,
  },
  {
    type: 'greatball',
    emoji: EMOJIS.POKEMON.GREATBALL,
    label: 'Great Balls',
    price: 400,
  },
  {
    type: 'ultraball',
    emoji: EMOJIS.POKEMON.ULTRABALL,
    label: 'Ultra Balls',
    price: 800,
  },
  {
    type: 'masterball',
    emoji: EMOJIS.POKEMON.MASTERBALL,
    label: 'Master Balls',
    price: 1_000_000,
  },
];
