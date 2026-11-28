import { Interaction } from 'discord.js';

import { BotState } from '@/interfaces/bot';
import { logger } from '@/lib/logger';

import {
  handleButtonInteraction,
  handleCommandInteraction,
  handleModalInteraction,
} from '../helpers';

const routeInteraction = async (state: BotState, interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    return handleCommandInteraction(state, interaction);
  }

  if (interaction.isButton()) {
    return handleButtonInteraction(state, interaction);
  }

  if (interaction.isModalSubmit()) {
    return handleModalInteraction(state, interaction);
  }
};

/**
 * Route an interaction to its handler. Errors are logged with the command or
 * component ID and the user, since most commands don't catch their own.
 *
 * @param state - The current bot state.
 * @param interaction - The incoming interaction.
 */
export const onInteractionCreate = async (
  state: BotState,
  interaction: Interaction,
) => {
  try {
    await routeInteraction(state, interaction);
  } catch (error) {
    logger.error(
      {
        err: error,
        command: interaction.isCommand() ? interaction.commandName : undefined,
        customId:
          interaction.isMessageComponent() || interaction.isModalSubmit()
            ? interaction.customId
            : undefined,
        discordId: interaction.user.id,
      },
      'Interaction failed',
    );
  }
};
