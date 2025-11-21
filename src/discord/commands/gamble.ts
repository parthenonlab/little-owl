import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { UserDocument } from '@/interfaces/user';
import { getCurrency, weightedRandom } from '@/lib/utils';
import { setDiscordUser } from '@/services/user';

import { reply } from '../helpers';

export const Gamble = {
  data: new SlashCommandBuilder()
    .setName(COPY.GAMBLE.NAME)
    .setDescription(COPY.GAMBLE.DESCRIPTION)
    .addStringOption(option =>
      option
        .setName(COPY.GAMBLE.OPTION_NAME)
        .setDescription(COPY.GAMBLE.OPTION_DESCRIPTION)
        .setRequired(true)
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument
  ) => {
    if (!CONFIG.FEATURES.GAMBLE.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const replies = {
      invalidInput: 'Enter a specific amount, "all", or "half".',
      invalidNegative: `You should gamble at least 1 ${CONFIG.CURRENCY.SINGLE}.`,
      lostAll: `You lost all of your ${CONFIG.CURRENCY.PLURAL}. ${EMOJIS.GAMBLE.LOST}`,
      maxReached: `You can only gamble up to ${CONFIG.FEATURES.GAMBLE.LIMIT} ${CONFIG.CURRENCY.PLURAL}. ${EMOJIS.GAMBLE.INVALID}`,
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

    const isOverLimit = async (amount: number) => {
      if (amount > CONFIG.FEATURES.GAMBLE.LIMIT) {
        reply({
          content: replies.maxReached,
          ephemeral: true,
          interaction: interaction,
        });
        return true;
      }
      return false;
    };

    const probability = {
      win: CONFIG.FEATURES.GAMBLE.WIN_PERCENT / 100,
      loss: 1 - CONFIG.FEATURES.GAMBLE.WIN_PERCENT / 100,
    };

    let points = user.cash;
    const result = weightedRandom(probability);

    if (arg === 'all') {
      if (await isOverLimit(points)) return;

      if (result === 'win') {
        points += user.cash;

        reply({
          content: `You won ${user.cash} ${getCurrency(user.cash)}! ${
            EMOJIS.GAMBLE.WIN
          } Current balance: ${points} ${EMOJIS.CURRENCY}`,
          ephemeral: false,
          interaction: interaction,
        });
      } else {
        points = 0;

        reply({
          content: replies.lostAll,
          ephemeral: false,
          interaction: interaction,
        });
      }
    } else if (arg === 'half') {
      const halfPoints = Math.round(user.cash / 2);
      if (await isOverLimit(halfPoints)) return;

      if (result === 'win') {
        points += halfPoints;

        reply({
          content: `You won ${halfPoints} ${getCurrency(halfPoints)}! ${
            EMOJIS.GAMBLE.WIN
          } Current balance: ${points} ${EMOJIS.CURRENCY}`,
          ephemeral: false,
          interaction: interaction,
        });
      } else {
        points -= halfPoints;

        reply({
          content: `You lost ${halfPoints} ${getCurrency(halfPoints)}. ${
            EMOJIS.GAMBLE.LOST
          } Current balance: ${points} ${EMOJIS.CURRENCY}`,
          ephemeral: false,
          interaction: interaction,
        });
      }
    } else if (amount < 1) {
      reply({
        content: replies.invalidNegative,
        ephemeral: true,
        interaction: interaction,
      });
    } else if (amount <= user.cash) {
      if (await isOverLimit(amount)) return;

      if (result === 'win') {
        points += amount;

        reply({
          content: `You won ${amount} ${getCurrency(amount)}! ${
            EMOJIS.GAMBLE.WIN
          } Current balance: ${points} ${EMOJIS.CURRENCY}`,
          ephemeral: false,
          interaction: interaction,
        });
      } else {
        points -= amount;

        reply({
          content: `You lost ${amount} ${getCurrency(amount)}. ${
            EMOJIS.GAMBLE.LOST
          } Current balance: ${points} ${EMOJIS.CURRENCY}`,
          ephemeral: false,
          interaction: interaction,
        });
      }
    } else if (amount > user.cash) {
      reply({
        content: replies.notEnough,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    await setDiscordUser(interaction.user.id, { cash: points });
  },
  getName: (): string => {
    return COPY.GAMBLE.NAME;
  },
};
