import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { COPY, EMOJIS, URLS } from '@/constants';
import { isFeatureEnabled } from '@/lib/config';
import { logger } from '@/lib/logger';

import { checkFeatureEnabled } from '../helpers';

export const Pokedex = {
  data: new SlashCommandBuilder()
    .setName(COPY.POKEDEX.NAME)
    .setDescription(COPY.POKEDEX.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!(await checkFeatureEnabled('POKEDEX', interaction))) return;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setEmoji(EMOJIS.POKEMON.POKEBALL)
        .setLabel('Pokédex')
        .setStyle(ButtonStyle.Link)
        .setURL(URLS.POKEDEX),
    );

    if (isFeatureEnabled('PCBOX')) {
      row.addComponents(
        new ButtonBuilder()
          .setEmoji(EMOJIS.POKEMON.POKEBALL)
          .setLabel('PC Box')
          .setStyle(ButtonStyle.Link)
          .setURL(URLS.PCBOX),
      );
    }

    try {
      await interaction.reply({ components: [row] });
    } catch (error) {
      logger.error(
        {
          err: error,
          command: COPY.POKEDEX.NAME,
          discordId: interaction.user.id,
        },
        'Failed to reply to command',
      );
    }
  },
  getName: (): string => {
    return COPY.POKEDEX.NAME;
  },
};
