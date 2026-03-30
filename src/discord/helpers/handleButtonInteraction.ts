import { ButtonInteraction } from 'discord.js';

import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';

export const handleButtonInteraction = async (
  _state: BotState,
  interaction: ButtonInteraction,
) => {
  if (interaction.user.bot) return;

  await interaction.deferUpdate();

  const [originalUserId, command, _action, payload] =
    interaction.customId.split(':');

  if (originalUserId !== interaction.user.id) return;

  // command: inventory
  if (command === dc.Inventory.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Inventory.onUpgradeClick(interaction, user, payload);
  }
};
