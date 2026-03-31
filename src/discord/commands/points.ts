import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { UserDocument } from '@/interfaces/user';
import { formatPriceToCode } from '@/lib/utils';

import { reply } from '../helpers';

export const Points = {
  data: new SlashCommandBuilder()
    .setName(COPY.POINTS.NAME)
    .setDescription(COPY.POINTS.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!CONFIG.FEATURES.POINTS.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    reply({
      content: `Your current balance is: ${formatPriceToCode(user.cash)} ${EMOJIS.CURRENCY}`,
      ephemeral: false,
      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.POINTS.NAME;
  },
};
