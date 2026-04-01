import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

import { COPY } from '@/constants';
import { checkFeatureEnabled, reply } from '../helpers';

export const EightBall = {
  data: new SlashCommandBuilder()
    .setName(COPY.EIGHTBALL.NAME)
    .setDescription(COPY.EIGHTBALL.DESCRIPTION)
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(COPY.EIGHTBALL.OPTION_NAME)
        .setDescription(COPY.EIGHTBALL.OPTION_DESCRIPTION)
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!await checkFeatureEnabled('8BALL', interaction)) return;

    const randomNum = Math.floor(
      Math.random() * COPY.EIGHTBALL.RESPONSES.length
    );

    const answer = COPY.EIGHTBALL.RESPONSES[randomNum];

    reply({
      content: `:8ball: says.. ${answer}`,

      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.EIGHTBALL.NAME;
  },
};
