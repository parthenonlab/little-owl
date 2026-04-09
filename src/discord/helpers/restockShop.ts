import { CONFIG } from '@/constants';
import { BotState } from '@/interfaces/bot';
import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';
import { updateShopStock } from '@/services/shop';

const sendRestockMessage = async (message: string) => {
  const { SERVER_ID } = getENV();
  const server = discord.guilds.cache.get(SERVER_ID);
  if (!server || !server.available) return;

  const channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.OWL);
  if (channel && channel.isTextBased()) {
    await channel.send(message);
  }
};

/**
 * Restocks pokeballs, greatballs, and ultraballs to their daily limits.
 *
 * @param state - The current bot state.
 */
export const restockShopDaily = async (state: BotState) => {
  if (
    state.shop.pokeball === 250 &&
    state.shop.greatball === 100 &&
    state.shop.ultraball === 50
  )
    return;

  state.shop.pokeball = 250;
  state.shop.greatball = 100;
  state.shop.ultraball = 50;

  await updateShopStock(state.shop);
  await sendRestockMessage('The Poké Mart has been restocked.');
};

/**
 * Restocks masterballs to their weekly limit.
 *
 * @param state - The current bot state.
 */
export const restockShopWeekly = async (state: BotState) => {
  if (state.shop.masterball !== 0) return;

  state.shop.masterball = 1;

  await updateShopStock(state.shop);
  await sendRestockMessage('A Master Ball is now available!');
};
