import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { formatPriceToCode } from '@/lib/utils';
import { incDiscordUser } from '@/services/user';

import { checkFeatureEnabled, reply } from '../helpers';

export const Bonus = {
  data: new SlashCommandBuilder()
    .setName(COPY.BONUS.NAME)
    .setDescription(COPY.BONUS.DESCRIPTION)
    .addUserOption(option =>
      option
        .setName(COPY.BONUS.OPTION1_NAME)
        .setDescription(COPY.BONUS.OPTION1_DESCRIPTION)
        .setRequired(true),
    )
    .addNumberOption(option =>
      option
        .setName(COPY.BONUS.OPTION2_NAME)
        .setDescription(COPY.BONUS.OPTION2_DESCRIPTION)
        .setRequired(true),
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    recipient: User,
  ) => {
    if (!await checkFeatureEnabled('BONUS', interaction)) return;

    const amount = Number(interaction.options.get('amount')?.value) || 0;

    const replies = {
      invalidAdmin: 'This is an admin-only command.',
      invalidNegative: `You should reward at least 1 ${CONFIG.CURRENCY.SINGLE}.`,
      success: `${recipient.displayName} has received ${formatPriceToCode(amount)} ${EMOJIS.CURRENCY}`,
    };

    if (interaction.user.id !== interaction.guild?.ownerId) {
      reply({
        content: replies.invalidAdmin,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    if (amount < 1) {
      reply({
        content: replies.invalidNegative,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    await incDiscordUser(recipient.id, 'cash', amount);

    reply({
      content: replies.success,

      interaction: interaction,
    });
  },
  getName: (): string => {
    return COPY.BONUS.NAME;
  },
};
