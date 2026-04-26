import { ModalSubmitInteraction } from 'discord.js';

import { POKEBALLS } from '@/constants/pokemon';
import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';

/**
 * Route a modal submit interaction to the appropriate command handler.
 *
 * @param state - The current bot state.
 * @param interaction - The modal submit interaction to handle.
 */
export const handleModalInteraction = async (
  state: BotState,
  interaction: ModalSubmitInteraction,
) => {
  if (interaction.user.bot) return;

  const [originalUserId, command, option] = interaction.customId.split(':');

  if (originalUserId !== interaction.user.id) return;

  // command: shop
  if (command === 'shop') {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    const pokeball = POKEBALLS.find(ball => ball.type === option);

    return dc.Shop.onModalSubmit(
      state,
      interaction,
      user,
      pokeball ?? POKEBALLS[0],
    );
  }
};
