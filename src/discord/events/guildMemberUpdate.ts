import { GuildMember, PartialGuildMember } from 'discord.js';

import { CONFIG } from '@/constants';
import { logger } from '@/lib/logger';
import { setDiscordUser } from '@/services/user';

import { log } from '../helpers';

const SUBSCRIBER_ROLE_IDS = [
  CONFIG.ROLES.SUBSCRIBER.DISCORD,
  CONFIG.ROLES.SUBSCRIBER.TWITCH,
];

const hasSubscriberRole = (member: GuildMember | PartialGuildMember) =>
  member.roles.cache.some(role => SUBSCRIBER_ROLE_IDS.includes(role.id));

const logMemberChange = (member: GuildMember, description: string) =>
  log({
    type: 'members',
    description,
    thumbnail: member.displayAvatarURL() || undefined,
    footer: `Discord User ID: ${member.id}`,
  });

/**
 * Log nickname and subscriber role changes, and keep the user's `subscriber` field in sync.
 * A partial old member (not cached) has no previous nickname or roles, so nothing is logged for it.
 *
 * @param oldMember - The member before the update (partial if it wasn't cached).
 * @param newMember - The member after the update.
 */
export const onGuildMemberUpdate = async (
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember,
) => {
  const { username } = newMember.user;

  if (!oldMember.partial && oldMember.nickname !== newMember.nickname) {
    logMemberChange(
      newMember,
      `${username} changed their nickname from ${oldMember.nickname ?? '(none)'} to ${
        newMember.nickname ?? '(none)'
      }.`,
    );
  }

  const hadSubRole = hasSubscriberRole(oldMember);
  const hasSubRole = hasSubscriberRole(newMember);

  if (hadSubRole === hasSubRole) return;

  if (!oldMember.partial) {
    logMemberChange(
      newMember,
      `${username} has ${hasSubRole ? 'gained' : 'lost'} the subscriber role.`,
    );
  }

  try {
    await setDiscordUser(newMember.id, { subscriber: hasSubRole });
  } catch (error) {
    logger.error(
      { err: error, discordId: newMember.id },
      'Failed to update subscriber status',
    );
  }
};
