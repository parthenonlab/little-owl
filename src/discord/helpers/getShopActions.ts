import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ShopState } from '@/interfaces/shop';
import { POKEBALLS } from '@/constants/pokemon';

/**
 * Build an action row of buy buttons for each in-stock item in the shop.
 *
 * @param shop - Current shop state with stock counts per ball type.
 * @param userId - Discord user ID used to scope button custom IDs.
 * @returns An action row containing buy buttons for available items.
 */
export const getShopActions = async (shop: ShopState, userId: string) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  POKEBALLS.forEach(ball => {
    if (shop[ball.type] > 0) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:shop:${ball.type}`)
          .setEmoji(ball.emoji)
          .setLabel('Buy')
          .setStyle(ButtonStyle.Secondary),
      );
    }
  });

  return row;
};
