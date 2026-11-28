import { TwitchIds } from '@/interfaces/bot';
import { helix, twitchAuth } from '@/lib/clients';
import { getENV } from '@/lib/config';
import { logger } from '@/lib/logger';
import { getTwitchToken, saveTwitchToken } from '@/services/token';

/**
 * Load the bot's stored Twitch token into the auth provider and persist every refresh.
 * Must run after the database is connected.
 *
 * @returns The bot's and broadcaster's Twitch user IDs. The broadcaster is the first entry in `CHANNELS`.
 * @throws If `CHANNELS` has no broadcaster, either user can't be found, or no token is stored for the bot.
 */
export const initTwitchAuth = async (): Promise<TwitchIds> => {
  const { CHANNELS, USERNAME } = getENV();
  const botName = USERNAME.toLowerCase();
  const broadcasterName = CHANNELS.split(',')[0]
    .trim()
    .replace(/^#/, '')
    .toLowerCase();

  if (!broadcasterName) throw new Error('CHANNELS has no broadcaster');

  const users = await helix.users.getUsersByNames([botName, broadcasterName]);
  const bot = users.find(user => user.name === botName);
  const broadcaster = users.find(user => user.name === broadcasterName);

  if (!bot) throw new Error(`Twitch user "${botName}" not found`);
  if (!broadcaster)
    throw new Error(`Twitch user "${broadcasterName}" not found`);

  const token = await getTwitchToken(bot.id);

  if (!token) {
    throw new Error(
      `No Twitch token stored for "${botName}". Run yarn twitch:auth${
        process.env.STAGING ? ':staging' : ''
      }.`,
    );
  }

  twitchAuth.onRefresh((userId, newToken) => saveTwitchToken(userId, newToken));
  twitchAuth.onRefreshFailure((userId, error) =>
    logger.error(
      { err: error, twitchId: userId },
      'Twitch token refresh failed',
    ),
  );
  twitchAuth.addUser(bot.id, token);

  return { botId: bot.id, broadcasterId: broadcaster.id };
};
