import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { COPY, URLS } from '@/constants';
import { LogCode } from '@/enums/logs';
import { checkFeatureEnabled, log } from '../helpers';

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
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
  getName: (): string => {
    return COPY.HELP.NAME;
  },
};
