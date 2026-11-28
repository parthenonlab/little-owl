import { GuildBan } from 'discord.js';

import { deleteActivity } from '@/services/activity';
import { deleteStats } from '@/services/stats';
import { deleteDiscordUser } from '@/services/user';

import { log } from '../helpers';

export const onGuildBanAdd = async (guildBan: GuildBan) => {
  const { user, reason } = guildBan;
  const reasonStr = reason ? `\nReason: ${reason}` : '';
  const thumbnail = user.displayAvatarURL() || undefined;

  log({
    type: 'moderation',
    platform: 'discord',
    description: `${user.username} has been banned from the server.${reasonStr}`,
    thumbnail,
    footer: `Discord User ID: ${user.id}`,
  });

  const removed = [
    (await deleteActivity(user.id)) && 'activities',
    (await deleteStats(user.id)) && 'stats',
    (await deleteDiscordUser(user.id)) && 'users',
  ].filter(Boolean);

  if (!removed.length) return;

  log({
    type: 'accounts',
    description: `Records for ${user.username} have been removed from: ${removed.join(', ')}.`,
    thumbnail,
    footer: `Discord User ID: ${user.id} | Display Name: ${user.displayName}`,
  });
};
