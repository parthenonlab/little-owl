import { ColorResolvable, EmbedBuilder } from 'discord.js';

import { CONFIG } from '@/constants';
import { ErrorLogProps, LogProps, LogType, Platform } from '@/interfaces/bot';
import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';
import { logger } from '@/lib/logger';

interface Destination {
  channel: string;
  color: string;
}

const LOG_DESTINATIONS = {
  accounts: {
    channel: CONFIG.CHANNELS.LOGS.ACCOUNTS,
    color: CONFIG.COLORS.BLUE,
  },
  members: {
    channel: CONFIG.CHANNELS.LOGS.MEMBERS,
    color: CONFIG.COLORS.BLUE,
  },
  messages: {
    channel: CONFIG.CHANNELS.LOGS.MESSAGES,
    color: CONFIG.COLORS.RED,
  },
  moderation: {
    channel: CONFIG.CHANNELS.LOGS.MODERATION,
    color: CONFIG.COLORS.YELLOW,
  },
  twitchNotifications: {
    channel: CONFIG.CHANNELS.LOGS.TWITCH_NOTIFICATIONS,
    color: CONFIG.COLORS.PINK,
  },
} satisfies Record<LogType, Destination>;

const ERRORS: Destination = {
  channel: CONFIG.CHANNELS.LOGS.ERRORS,
  color: CONFIG.COLORS.RED,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  discord: 'Discord',
  twitch: 'Twitch',
};

/** Write a log to the app logger when it can't be delivered to Discord. */
const fallback = (
  destination: string,
  props: ErrorLogProps,
  reason: string,
) => {
  const { title, description } = props;
  logger.warn(
    { destination, title, description, reason },
    'Discord log undelivered',
  );
};

/**
 * Build and send a log embed. Staging uses the same channels as production.
 * Falls back to the app logger when the message can't be delivered, and never rejects.
 */
const send = async (
  name: string,
  { channel: channelId, color }: Destination,
  props: ErrorLogProps,
  authorName?: string,
): Promise<void> => {
  const { title, description, image, authorIcon, thumbnail, footer } = props;
  const { ADMIN_SERVER_ID } = getENV();

  const server = discord.guilds.cache.get(ADMIN_SERVER_ID);
  if (!server?.available)
    return fallback(name, props, 'admin server unavailable');

  const channel = server.channels.cache.get(channelId);
  if (!channel?.isTextBased())
    return fallback(name, props, 'log channel unavailable');

  const botEmbed = new EmbedBuilder()
    .setColor(color as ColorResolvable)
    .setDescription(description);

  if (authorName || authorIcon) {
    botEmbed.setAuthor({
      name: authorName ?? `${server.name} Server`,
      iconURL: authorIcon,
    });
  }

  if (title) botEmbed.setTitle(title);
  if (image) botEmbed.setImage(image);
  if (thumbnail) botEmbed.setThumbnail(thumbnail);
  if (footer) botEmbed.setFooter({ text: footer });

  try {
    await channel.send({ embeds: [botEmbed] });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fallback(name, props, `send failed: ${reason}`);
  }
};

/**
 * Send an audit log embed to the channel for its type.
 * Moderation embeds show their platform in the author line.
 * For errors, use `logger.error()`: it reaches the errors channel via `forwardErrorsToDiscord()`.
 *
 * @param props - Log properties including type, title, description, and optional media fields.
 */
export const log = (props: LogProps): Promise<void> => {
  const authorName = props.platform
    ? PLATFORM_LABELS[props.platform]
    : undefined;
  return send(props.type, LOG_DESTINATIONS[props.type], props, authorName);
};

/**
 * Send an embed to the errors channel. Only for `forwardErrorsToDiscord()`.
 *
 * @param props - Embed title, description, and footer.
 */
export const logToErrorsChannel = (props: ErrorLogProps): Promise<void> =>
  send('errors', ERRORS, props);
