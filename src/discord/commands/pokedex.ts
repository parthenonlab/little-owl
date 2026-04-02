import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { COPY, EMOJIS, URLS } from '@/constants';
import { LogCode } from '@/enums/logs';

import { checkFeatureEnabled, log } from '../helpers';

export const Pokedex = {
  data: new SlashCommandBuilder()
    .setName(COPY.POKEDEX.NAME)
    .setDescription(COPY.POKEDEX.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!(await checkFeatureEnabled('POKEDEX', interaction))) return;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setEmoji(EMOJIS.POKEMON.POKEBALL)
        .setLabel('Pokedex')
        .setStyle(ButtonStyle.Link)
        .setURL(URLS.POKEDEX),
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
    return COPY.POKEDEX.NAME;
  },
};
