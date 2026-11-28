import { GuildBan } from 'discord.js';

import { log } from '../helpers';

export const onGuildBanRemove = async ({ user }: GuildBan) => {
  log({
    type: 'moderation',
    platform: 'discord',
    description: `${user.username} has been unbanned from the server.`,
    thumbnail: user.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${user.id}`,
  });
};
