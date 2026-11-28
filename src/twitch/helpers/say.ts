import { TwitchIds } from '@/interfaces/bot';
import { helix } from '@/lib/clients';
import { logger } from '@/lib/logger';

/**
 * Send a message to the broadcaster's chat as the bot, using an app token so it shows the Chat Bot badge.
 * Requires the bot to have `user:write:chat` + `user:bot` and to be a moderator in the channel.
 *
 * @param ids - The bot's and broadcaster's Twitch user IDs.
 * @param message - The message to send. Chat commands like `/me` are not supported.
 */
export const say = async (ids: TwitchIds, message: string): Promise<void> => {
  try {
    const sent = await helix.chat.sendChatMessageAsApp(
      ids.botId,
      ids.broadcasterId,
      message,
    );

    if (sent.isSent) return;

    logger.error(
      {
        dropReason:
          sent.dropReasonMessage ?? sent.dropReasonCode ?? 'unknown reason',
        message,
      },
      'Twitch chat message dropped',
    );
  } catch (error) {
    logger.error({ err: error, message }, 'Failed to send Twitch chat message');
  }
};
