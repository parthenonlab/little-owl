import { GuildMember, PartialGuildMember } from 'discord.js';

import { LogCode } from '@/enums/logs';

import { log } from '../helpers';

export const onGuildMemberRemove = async (
  member: GuildMember | PartialGuildMember,
) => {
  if (!member.guild?.available) return;

  log({
    type: LogCode.Leave,
    description: `${member.user.username} aka ${member.displayName} has left or has been kicked from the server.`,
    thumbnail: member.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${member.id}`,
  });
};
