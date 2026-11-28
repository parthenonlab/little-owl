import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { COPY, URLS } from '@/constants';
import { logger } from '@/lib/logger';

import { checkFeatureEnabled } from '../helpers';

export const Help = {
  data: new SlashCommandBuilder()
    .setName(COPY.HELP.NAME)
    .setDescription(COPY.HELP.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!(await checkFeatureEnabled('HELP', interaction))) return;

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setEmoji('📚')
          .setLabel('Commands')
          .setStyle(ButtonStyle.Link)
          .setURL(URLS.COMMANDS),
      )
      .addComponents(
        new ButtonBuilder()
          .setEmoji('📜')
          .setLabel('FAQ')
          .setStyle(ButtonStyle.Link)
          .setURL(URLS.FAQ),
      );

    try {
      await interaction.reply({ components: [row] });
    } catch (error) {
      logger.error(
        { err: error, command: COPY.HELP.NAME, discordId: interaction.user.id },
        'Failed to reply to command',
      );
    }
  },
  getName: (): string => {
    return COPY.HELP.NAME;
  },
};
