import { EMOJIS } from '@/constants';
import { getInventory } from '@/services/inventory';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const getExploreActions = async (userId: string) => {
  const row = new ActionRowBuilder<ButtonBuilder>();
  const inventory = await getInventory(userId);

  if (inventory) {
    if (inventory.balls.pokeball > 0) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:explore:pokeball`)
          .setEmoji(EMOJIS.POKEMON.POKEBALL)
          .setLabel(`Use (${inventory.balls.pokeball})`)
          .setStyle(ButtonStyle.Secondary),
      );
    }

    if (inventory.balls.greatball > 0) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:explore:greatball`)
          .setEmoji(EMOJIS.POKEMON.GREATBALL)
          .setLabel(`Use (${inventory.balls.greatball})`)
          .setStyle(ButtonStyle.Secondary),
      );
    }

    if (inventory.balls.ultraball > 0) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:explore:ultraball`)
          .setEmoji(EMOJIS.POKEMON.ULTRABALL)
          .setLabel(`Use (${inventory.balls.ultraball})`)
          .setStyle(ButtonStyle.Secondary),
      );
    }

    if (inventory.balls.masterball > 0) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${userId}:explore:masterball`)
          .setEmoji(EMOJIS.POKEMON.MASTERBALL)
          .setLabel(`Use (${inventory.balls.masterball})`)
          .setStyle(ButtonStyle.Secondary),
      );
    }
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`${userId}:explore:run`)
      .setLabel('Run')
      .setStyle(ButtonStyle.Secondary),
  );

  return row;
};
