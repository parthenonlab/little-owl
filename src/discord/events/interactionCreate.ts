import { Interaction } from 'discord.js';
import { BotState } from '@/interfaces/bot';

import {
  handleButtonInteraction,
  handleCommandInteraction,
  handleModalInteraction,
} from '../helpers';

export const onInteractionCreate = async (
  state: BotState,
  interaction: Interaction,
) => {
  if (interaction.isChatInputCommand()) {
    await handleCommandInteraction(state, interaction);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(state, interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModalInteraction(state, interaction);
  }
};
