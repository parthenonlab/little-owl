import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { POKEBALLS } from '@/constants/pokemon';
import { PokeballObject } from '@/interfaces/pokemon';
import { getInventory } from '@/services/inventory';

/**
 * Build an action row of pokeball buttons for an active Pokemon encounter.
 *
 * @param userId - Discord user ID used to scope button custom IDs.
 * @returns An action row containing use buttons for available balls and a run button.
 */
export const getExploreActions = async (userId: string) => {
  const row = new ActionRowBuilder<ButtonBuilder>();
  const inventory = await getInventory(userId);

  if (inventory) {
    POKEBALLS.forEach((ball: PokeballObject) => {
      const amount = inventory.balls[ball.type];
      if (amount > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`${userId}:explore:${ball.type}`)
            .setEmoji(ball.emoji)
            .setLabel(`Use (${amount})`)
            .setStyle(ButtonStyle.Secondary),
        );
      }
    });
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`${userId}:explore:run`)
      .setLabel('Run')
      .setStyle(ButtonStyle.Secondary),
  );

  return row;
};
