import { ButtonInteraction } from 'discord.js';

import { POKEBALLS } from '@/constants/pokemon';
import { BotState } from '@/interfaces/bot';
import { findOrCreateDiscordUser } from '@/services/user';

import * as dc from '../commands';

export const handleButtonInteraction = async (
  state: BotState,
  interaction: ButtonInteraction,
) => {
  if (interaction.user.bot) return;

  const [originalUserId, command, option] = interaction.customId.split(':');

  if (originalUserId !== interaction.user.id) return;

  // command: shop
  if (command === dc.Shop.getName()) {
    const pokeball = POKEBALLS.find(ball => ball.type === option);

    return dc.Shop.onBuyClick(state, interaction, pokeball ?? POKEBALLS[0]);
  }

  // command: inventory
  if (command === dc.Inventory.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (!user) return;

    return dc.Inventory.onUpgradeClick(interaction, user);
  }
};
