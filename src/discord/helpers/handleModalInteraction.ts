import { ModalSubmitInteraction } from 'discord.js';

import { BallType } from '@/constants/pokemon';
import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';

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

    return dc.Shop.onModalSubmit(state, interaction, user, option as BallType);
  }
};
