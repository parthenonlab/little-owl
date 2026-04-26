import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { COPY } from '@/constants';
import { BotState } from '@/interfaces/bot';
import { sleepTime } from '@/lib/config';

import { checkFeatureEnabled, reply } from '../helpers';

export const Sleep = {
  data: new SlashCommandBuilder()
    .setName(COPY.SLEEP.NAME)
    .setDescription(COPY.SLEEP.DESCRIPTION),
  execute: async (
    state: BotState,
    interaction: ChatInputCommandInteraction,
  ) => {
    if (!(await checkFeatureEnabled('SLEEP', interaction))) return;

    reply({
      content: '🦉 Little Owl: Good night!',

      interaction: interaction,
    });

    sleepTime(state);
  },
  getName: (): string => {
    return COPY.SLEEP.NAME;
  },
};
