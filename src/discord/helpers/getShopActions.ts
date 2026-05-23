import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ShopState } from '@/interfaces/shop';
import { POKEBALLS } from '@/constants/pokemon';

/**
 * Build an action row of buy buttons for each in-stock item the user can afford.
 *
 * @param shop - Current shop state with stock counts per ball type.
 * @param userId - Discord user ID used to scope button custom IDs.
 * @param userCash - User's current cash balance; buttons are hidden for items they can't afford.
 * @returns An action row containing buy buttons for available, affordable items.
 */
export const getShopActions = (
  shop: ShopState,
  userId: string,
  userCash: number,
): ActionRowBuilder<ButtonBuilder> | null => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  POKEBALLS.forEach(ball => {
    if (shop[ball.type] > 0 && userCash >= ball.price) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:shop:${ball.type}`)
          .setEmoji(ball.emoji)
          .setLabel('Buy')
          .setStyle(ButtonStyle.Secondary),
      );
    }
  });

  return row.components.length > 0 ? row : null;
};
