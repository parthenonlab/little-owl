import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

import { UserDocument } from '@parthenonlab/models';

import { COPY } from '@/constants';
import { LogCode } from '@/enums/logs';
import { deleteUser, getUserById, setDiscordUser } from '@/services/user';

import { checkFeatureEnabled, log, reply } from '../helpers';

export const AccountLink = {
  data: new SlashCommandBuilder()
    .setName(COPY.LINK.NAME)
    .setDescription(COPY.LINK.DESCRIPTION)
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(COPY.LINK.OPTION_NAME)
        .setDescription(COPY.LINK.OPTION_DESCRIPTION)
        .setRequired(true),
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!(await checkFeatureEnabled('LINK', interaction))) return;

    const code = interaction.options.get('code')?.value;

    if (user.twitch_id) {
      reply({
        content: COPY.LINK.RESPONSES.LINKED_DISCORD,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const userId = code?.toString();
    const twitchUser = userId ? await getUserById(userId) : null;

    if (!twitchUser) {
      await interaction.reply({
        content: COPY.LINK.RESPONSES.INVALID,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (twitchUser && twitchUser.discord_id) {
      await interaction.reply({
        content: COPY.LINK.RESPONSES.LINKED_TWITCH,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    let points = user.cash + twitchUser.cash;

    await setDiscordUser(interaction.user.id, {
      twitch_id: twitchUser.twitch_id,
      twitch_username: twitchUser.twitch_username,
      cash: points,
    });

    if (userId) await deleteUser(userId);

    await interaction.reply({
      content: COPY.LINK.RESPONSES.SUCCESS,
      flags: MessageFlags.Ephemeral,
    });

    log({
      type: LogCode.Activity,
      description: `${user.discord_username} aka ${user.discord_name} has linked their Twitch account: ${twitchUser.twitch_username}`,
    });
  },
  getName: (): string => {
    return COPY.LINK.NAME;
  },
};
