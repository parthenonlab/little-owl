import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

import { UserDocument } from '@parthenonlab/models';

import { COPY } from '@/constants';
import { LogCode } from '@/enums/logs';
import { createUser, setDiscordUser } from '@/services/user';

import { checkFeatureEnabled, log, reply } from '../helpers';

export const AccountUnlink = {
  data: new SlashCommandBuilder()
    .setName(COPY.UNLINK.NAME)
    .setDescription(COPY.UNLINK.DESCRIPTION)
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(COPY.UNLINK.OPTION_NAME)
        .setDescription(COPY.UNLINK.OPTION_DESCRIPTION)
        .setRequired(true),
    ),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!(await checkFeatureEnabled('UNLINK', interaction))) return;

    if (!user.twitch_id) {
      reply({
        content: COPY.UNLINK.RESPONSES.NOLINK,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const twitchName = interaction.options.get('username')?.value;

    if (user.twitch_username !== twitchName) {
      reply({
        content: COPY.UNLINK.RESPONSES.INVALID,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    await createUser({
      twitch_id: user.twitch_id,
      twitch_username: user.twitch_username,
      cash: 0,
    });

    await setDiscordUser(interaction.user.id, {
      twitch_id: null,
      twitch_username: null,
    });

    await interaction.reply({
      content: COPY.UNLINK.RESPONSES.SUCCESS,
      flags: MessageFlags.Ephemeral,
    });

    log({
      type: LogCode.Activity,
      description: `${user.discord_username} aka ${user.discord_name} has unlinked their account: ${user.twitch_username}`,
    });
  },
  getName: (): string => {
    return COPY.UNLINK.NAME;
  },
};
