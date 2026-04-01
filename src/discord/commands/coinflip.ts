import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { COPY, EMOJIS } from '@/constants';
import { weightedRandom } from '@/lib/utils';

import { checkFeatureEnabled, reply } from '../helpers';

export const CoinFlip = {
  data: new SlashCommandBuilder()
    .setName(COPY.COINFLIP.NAME)
    .setDescription(COPY.COINFLIP.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!await checkFeatureEnabled('COINFLIP', interaction)) return;

    const probability = { Heads: 0.5, Tails: 0.5 };
    const result = weightedRandom(probability);

    let currencyEmoji = EMOJIS.CURRENCY_TAILS;
    if (result === 'Heads') currencyEmoji = EMOJIS.CURRENCY;

    reply({
      content: `You got... ${result}! ${currencyEmoji}`,

      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.COINFLIP.NAME;
  },
};
