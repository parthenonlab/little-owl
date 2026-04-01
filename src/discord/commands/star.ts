import {
  ColorResolvable,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  User,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { LogCode } from '@/enums/logs';
import { getActivity, updateActivity } from '@/services/activity';
import { incDiscordUser } from '@/services/user';
import { checkFeatureEnabled, log, reply } from '../helpers';

export const Star = {
  data: new SlashCommandBuilder()
    .setName(COPY.STAR.NAME)
    .setDescription(COPY.STAR.DESCRIPTION)
    .addUserOption(option =>
      option
        .setName(COPY.STAR.OPTION_NAME)
        .setDescription(COPY.STAR.OPTION_DESCRIPTION)
        .setRequired(true),
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    recipient: User,
  ) => {
    if (!await checkFeatureEnabled('STAR', interaction)) return;

    const replies = {
      error: 'Something went wrong. Please try again later.',
      invalidMax: `You can only give one star per day. ${EMOJIS.STAR.INVALID}`,
      invalidSelf: `You can't give yourself a star. ${EMOJIS.STAR.INVALID}`,
    };

    if (interaction.user.id === recipient.id) {
      reply({
        content: replies.invalidSelf,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const starActivity = await getActivity(interaction.user.id, 'star');

    const now = new Date();
    const lastUsed = starActivity?.last_used;

    const usedToday =
      lastUsed !== null &&
      lastUsed !== undefined &&
      lastUsed.getFullYear() === now.getFullYear() &&
      lastUsed.getMonth() === now.getMonth() &&
      lastUsed.getDate() === now.getDate();

    if (usedToday) {
      reply({
        content: replies.invalidMax,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const [updatedActivity] = await Promise.all([
      updateActivity(interaction.user.id, {
        $inc: { 'star.total_given': 1 },
        $set: { 'star.last_used': now },
      }),
      incDiscordUser(recipient.id, 'stars', 1),
    ]);

    if (!updatedActivity) {
      reply({
        content: replies.error,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const botEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.YELLOW as ColorResolvable)
      .setTitle(
        `${recipient.displayName} got a star from ${interaction.user.displayName}!`,
      )
      .setDescription(
        `Endorse a community member by giving them a star! ${EMOJIS.STAR.EMBED}`,
      );

    try {
      await interaction.reply({ embeds: [botEmbed] });
    } catch (error) {
      log({ type: LogCode.Error, description: JSON.stringify(error) });
    }
  },
  getName: (): string => {
    return COPY.STAR.NAME;
  },
};
