import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UserDocument } from '@parthenonlab/models';

import { COPY, EMOJIS } from '@/constants';
import { formatNumberToCode } from '@/lib/utils';
import { checkFeatureEnabled, reply } from '../helpers';

export const Points = {
  data: new SlashCommandBuilder()
    .setName(COPY.POINTS.NAME)
    .setDescription(COPY.POINTS.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!(await checkFeatureEnabled('POINTS', interaction))) return;

    reply({
      content: `Your current balance is: ${formatNumberToCode(user.cash)} ${EMOJIS.CURRENCY}`,

      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.POINTS.NAME;
  },
};
