import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { TwitchIds } from '@/interfaces/bot';
import { helix } from '@/lib/clients';
import { formatError } from '@/lib/utils';

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

    log({
      type: LogCode.Error,
      description: `Twitch chat message dropped: ${
        sent.dropReasonMessage ?? sent.dropReasonCode ?? 'unknown reason'
      }\n\nMessage: ${message}`,
    });
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
  }
};
