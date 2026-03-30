import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { EMOJIS } from '@/constants';
import { SHOP_PRICES } from '@/constants/pokemon';
import { ShopState } from '@/interfaces/shop';

export const getShopActions = async (shop: ShopState, userId: string) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  if (shop.pokeball > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${userId}:shop:pokeball:${SHOP_PRICES.pokeball}`)
        .setEmoji(EMOJIS.POKEMON.POKEBALL)
        .setLabel('Buy')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (shop.greatball > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${userId}:shop:greatball:${SHOP_PRICES.greatball}`)
        .setEmoji(EMOJIS.POKEMON.GREATBALL)
        .setLabel('Buy')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (shop.ultraball > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${userId}:shop:ultraball:${SHOP_PRICES.ultraball}`)
        .setEmoji(EMOJIS.POKEMON.ULTRABALL)
        .setLabel('Buy')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (shop.masterball > 0) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${userId}:shop:masterball:${SHOP_PRICES.masterball}`)
        .setEmoji(EMOJIS.POKEMON.MASTERBALL)
        .setLabel('Buy')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  return row;
};
