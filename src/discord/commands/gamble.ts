import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UserDocument } from '@parthenonlab/models';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { formatNumberToCode, getCurrency, weightedRandom } from '@/lib/utils';
import { updateActivity } from '@/services/activity';
import { saveGambleStats } from '@/services/stats';
import { setDiscordUser } from '@/services/user';

import { checkFeatureEnabled, reply } from '../helpers';

export const Gamble = {
  data: new SlashCommandBuilder()
    .setName(COPY.GAMBLE.NAME)
    .setDescription(COPY.GAMBLE.DESCRIPTION)
    .addStringOption(option =>
      option
        .setName(COPY.GAMBLE.OPTION_NAME)
        .setDescription(COPY.GAMBLE.OPTION_DESCRIPTION)
        .setRequired(true),
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!(await checkFeatureEnabled('GAMBLE', interaction))) return;

    const replies = {
      invalidInput: 'Enter a specific amount, "all", or "half".',
      invalidNegative: `You should gamble at least 1 ${CONFIG.CURRENCY.SINGLE}.`,
      lostAll: `You lost all of your ${CONFIG.CURRENCY.PLURAL}. ${EMOJIS.GAMBLE.LOST}`,
      noPoints: `You have no ${CONFIG.CURRENCY.SINGLE} to gamble. ${EMOJIS.GAMBLE.INVALID}`,
      notEnough: `You don't have enough ${CONFIG.CURRENCY.PLURAL} to gamble. ${EMOJIS.GAMBLE.INVALID}`,
    };

    if (user.cash < 1) {
      reply({
        content: replies.noPoints,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const arg = interaction.options.get('amount')?.value;
    const amount = typeof arg === 'string' ? parseInt(arg, 10) : 0;

    if (isNaN(amount) && arg !== 'all' && arg !== 'half') {
      reply({
        content: replies.invalidInput,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const probability = {
      win: CONFIG.GAMBLE.WIN_PERCENT / 100,
      loss: 1 - CONFIG.GAMBLE.WIN_PERCENT / 100,
    };

    const result = weightedRandom(probability);
    const won = result === 'win';

    let wager: number;

    if (arg === 'all') {
      wager = user.cash;
    } else if (arg === 'half') {
      wager = Math.round(user.cash / 2);
    } else if (amount < 1) {
      reply({
        content: replies.invalidNegative,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    } else if (amount > user.cash) {
      reply({
        content: replies.notEnough,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    } else {
      wager = amount;
    }

    const newBalance = won ? user.cash + wager : user.cash - wager;

    if (won) {
      reply({
        content: `You won ${formatNumberToCode(wager)} ${getCurrency(wager)}! ${
          EMOJIS.GAMBLE.WIN
        } Current balance: ${formatNumberToCode(newBalance)} ${EMOJIS.CURRENCY}`,

        interaction: interaction,
      });
    } else if (newBalance === 0) {
      reply({
        content: replies.lostAll,

        interaction: interaction,
      });
    } else {
      reply({
        content: `You lost ${formatNumberToCode(wager)} ${getCurrency(wager)}. ${
          EMOJIS.GAMBLE.LOST
        } Current balance: ${formatNumberToCode(newBalance)} ${EMOJIS.CURRENCY}`,

        interaction: interaction,
      });
    }

    await setDiscordUser(interaction.user.id, { cash: newBalance });
    await saveGambleStats(interaction.user.id, { won, wager });
    await updateActivity(interaction.user.id, { $set: { 'gamble.last_used': new Date() } });
  },
  getName: (): string => {
    return COPY.GAMBLE.NAME;
  },
};
