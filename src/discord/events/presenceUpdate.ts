import {
  Activity,
  ActivityType,
  ColorResolvable,
  EmbedBuilder,
  Guild,
  GuildMember,
  Presence,
  Role,
} from 'discord.js';

import { CONFIG } from '@/constants';
import { BotState } from '@/interfaces/bot';
import { logger } from '@/lib/logger';

import { log } from '../helpers';

const STREAM_ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const logError = (error: unknown) =>
  logger.error({ err: error }, 'Presence update failed');

const getStreamActivity = (presence: Presence | null) =>
  presence?.activities.find(
    activity => activity.type === ActivityType.Streaming,
  );

const findLiveRole = (guild: Guild) =>
  guild.roles.cache.find(
    role => CONFIG.ROLES.LIVE.ENABLED && role.id === CONFIG.ROLES.LIVE.ID,
  );

/**
 * Add the live role to a member who doesn't have it yet, and log it.
 *
 * @param member - The member who started streaming.
 * @param liveRole - The live role, or undefined if disabled or not manageable.
 */
const addLiveRole = (member: GuildMember, liveRole?: Role) => {
  if (!liveRole) return;
  if (member.roles.cache.has(liveRole.id)) return;

  member.roles
    .add(liveRole)
    .then(() =>
      log({
        type: 'members',
        description: `${member.user.username} aka ${member.displayName} has started streaming.`,
        footer: `Discord User ID: ${member.id}`,
      }),
    )
    .catch(logError);
};

/**
 * Remove the live role from a member who has it.
 *
 * @param member - The member who is no longer streaming.
 * @param liveRole - The live role, or undefined if disabled or not manageable.
 */
const removeLiveRole = (member: GuildMember, liveRole?: Role) => {
  if (!liveRole) return;
  if (!member.roles.cache.has(liveRole.id)) return;

  member.roles.remove(liveRole).catch(logError);
};

/**
 * Announce the stream in the alert channel with `@everyone`, then start the cooldown.
 *
 * @param state - The bot state holding the alert cooldown.
 * @param guild - The server the alert is posted in.
 * @param member - The streaming member (the server owner).
 * @param streamActivity - The member's streaming activity.
 */
const sendStreamAlert = (
  state: BotState,
  guild: Guild,
  member: GuildMember,
  streamActivity: Activity,
) => {
  if (!CONFIG.ALERTS.LIVE.ENABLED) return;
  if (Date.now() < state.cooldowns.stream.getTime()) return;

  const channel = guild.channels.cache.get(CONFIG.ALERTS.LIVE.ID);
  if (!channel?.isTextBased()) return;

  let liveMessage = '';

  if (streamActivity.details) liveMessage += streamActivity.details;
  if (streamActivity.url) liveMessage += `\n\n${streamActivity.url}`;

  const embed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
    .setAuthor({
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    })
    .setTitle(`Now Streaming ${streamActivity.state}`)
    .setDescription(liveMessage)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({
      text: `Posted on ${streamActivity.createdAt.toDateString()}`,
    });

  const liveImage = streamActivity.assets?.largeImageURL();
  if (liveImage) embed.setImage(liveImage);

  channel
    .send({
      content: `@everyone ${member.displayName} is now live!`,
      embeds: [embed],
    })
    .catch(logError)
    .finally(() => {
      state.cooldowns.stream = new Date(Date.now() + STREAM_ALERT_COOLDOWN_MS);
    });
};

export const onPresenceUpdate = async (
  state: BotState,
  oldPresence: Presence | null,
  newPresence: Presence,
) => {
  const { guild, member } = newPresence;

  if (!guild?.available) return;
  if (!member) return;

  const canBotManage = member.manageable || member.id === guild.ownerId;
  const liveRole = canBotManage ? findLiveRole(guild) : undefined;

  const isOffline =
    newPresence.status === 'offline' || newPresence.status === 'invisible';
  const streamActivity = isOffline ? undefined : getStreamActivity(newPresence);

  if (!streamActivity) return removeLiveRole(member, liveRole);

  addLiveRole(member, liveRole);

  if (getStreamActivity(oldPresence)) return;
  if (member.id !== guild.ownerId) return;

  sendStreamAlert(state, guild, member, streamActivity);
};
