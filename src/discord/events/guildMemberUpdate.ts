import { GuildMember, PartialGuildMember } from 'discord.js';

import { CONFIG } from '@/constants';
import { LogCode } from '@/enums/logs';
import { setDiscordUser } from '@/services/user';

import { log } from '../helpers';

const SUBSCRIBER_ROLE_IDS = [
  CONFIG.ROLES.SUBSCRIBER.DISCORD,
  CONFIG.ROLES.SUBSCRIBER.TWITCH,
];

export const onGuildMemberUpdate = async (
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember,
) => {
  const hadSubRole = oldMember.roles.cache.some(r =>
    SUBSCRIBER_ROLE_IDS.includes(r.id),
  );
  const hasSubRole = newMember.roles.cache.some(r =>
    SUBSCRIBER_ROLE_IDS.includes(r.id),
  );

  if (hadSubRole === hasSubRole) return;

  try {
    await setDiscordUser(newMember.id, { subscriber: hasSubRole } as any);
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
  }
};
