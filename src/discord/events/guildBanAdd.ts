import { GuildBan } from 'discord.js';

import { LogCode } from '@/enums/logs';
import { deleteActivity } from '@/services/activity';
import { deleteStats } from '@/services/stats';
import { deleteUserByDiscordId } from '@/services/user';

import { log } from '../helpers/log';

export const onGuildBanAdd = async (guildBan: GuildBan) => {
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
    description: `Record for ${user.username} has been removed from the activities collection.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });

  await deleteStats(user.id);

  log({
    type: LogCode.Deleted,
    description: `Record for ${user.username} has been removed from the stats collection.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });

  await deleteUserByDiscordId(user.id);

  log({
    type: LogCode.Deleted,
    description: `Record for ${user.username} has been removed from the users collection.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });
};
