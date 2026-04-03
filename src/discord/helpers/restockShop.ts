import { BotState } from '@/interfaces/bot';
import { updateShopStock } from '@/services/shop';

/**
 * Restocks pokeballs, greatballs, and ultraballs to their daily limits.
 *
 * @param state - The current bot state.
 */
export const restockShopDaily = async (state: BotState) => {
  state.shop.pokeball = 250;
  state.shop.greatball = 100;
  state.shop.ultraball = 50;
  state.shop.lastDailyRestock = new Date();
  await updateShopStock(state.shop);
};

/**
 * Restocks masterballs to their weekly limit.
 *
 * @param state - The current bot state.
 */
export const restockShopWeekly = async (state: BotState) => {
  state.shop.masterball = 1;
  state.shop.lastWeeklyRestock = new Date();
  await updateShopStock(state.shop);
};
