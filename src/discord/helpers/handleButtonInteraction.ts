import { ButtonInteraction } from 'discord.js';

import { BallType } from '@/constants/pokemon';
import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';

export const handleButtonInteraction = async (
  state: BotState,
  interaction: ButtonInteraction,
) => {
  if (interaction.user.bot) return;

  const [originalUserId, command, option, payload] =
    interaction.customId.split(':');

  if (originalUserId !== interaction.user.id) return;

  // command: shop
  if (command === dc.Shop.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Shop.onBuyClick(state, interaction, option as BallType);
  }

  // avoid deferring buttons that trigger modals
  await interaction.deferUpdate();

  // command: inventory
  if (command === dc.Inventory.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Inventory.onUpgradeClick(interaction, user, payload);
  }
};
