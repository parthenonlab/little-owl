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

  // command: explore
  if (command === dc.Explore.getName()) {
    if (option === 'run') return dc.Explore.onRunClick(state, interaction);

    const pokeball = POKEBALLS.find(ball => ball.type === option)!;
    return dc.Explore.onUseClick(state, interaction, pokeball);
  }

  // command: shop
  else if (command === dc.Shop.getName()) {
    const pokeball = POKEBALLS.find(ball => ball.type === option);
    return dc.Shop.onBuyClick(state, interaction, pokeball!);
  }

  // command: inventory
  else if (command === dc.Inventory.getName()) {
    const user = await findOrCreateDiscordUser(interaction.user);
    if (user) dc.Inventory.onUpgradeClick(interaction, user);
  }
};
