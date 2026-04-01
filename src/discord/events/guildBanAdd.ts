import { GuildBan } from 'discord.js';

import { LogCode } from '@/enums/logs';
import { getENV } from '@/lib/config';

import { deleteActivity } from '@/services/activity';
import { deleteStats } from '@/services/stat';
import { deleteUserByDiscordId } from '@/services/user';

import { log } from '../helpers/log';

export const onGuildBanAdd = async (guildBan: GuildBan) => {
  const { MONGODB_ACTS, MONGODB_STATS, MONGODB_USERS } = getENV();
  const { user, reason } = guildBan;
  const reasonStr = reason ? `\nReason: ${reason}` : '';

  log({
    type: LogCode.Leave,
    description: `${user.username} has been banned from the server.${reasonStr}`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id}`,
  });

  await deleteActivity(user.id);

  log({
    type: LogCode.Deleted,
    description: `Record for ${user.username} has been removed from collection ${MONGODB_ACTS}.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });

  await deleteStats(user.id);

  log({
    type: LogCode.Deleted,
    description: `Record for ${user.username} has been removed from collection ${MONGODB_STATS}.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });

  await deleteUserByDiscordId(user.id);

  log({
    type: LogCode.Deleted,
    description: `Record for ${user.username} has been removed from collection ${MONGODB_USERS}.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });
};
