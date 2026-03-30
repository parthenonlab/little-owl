import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ShopState } from '@/interfaces/shop';
import { POKEBALLS } from '@/constants/pokemon';

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
