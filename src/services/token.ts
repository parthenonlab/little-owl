import { AccessToken } from '@twurple/auth';

import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';
import { formatError, fromTokenFields, toTokenFields } from '@/lib/utils';
import { TokenModel } from '@/models/token';

/**
 * Get the stored Twitch OAuth token for a user.
 *
 * @param userId - Twitch user ID the token belongs to.
 * @returns The token in Twurple's format, or null if not found or on error.
 */
export const getTwitchToken = async (
  userId: string,
): Promise<AccessToken | null> => {
  try {
    const token = await TokenModel.findOne({ user_id: userId }).lean();

    if (!token) return null;

    return fromTokenFields(token);
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};

/**
 * Create or replace the stored Twitch OAuth token for a user.
 *
 * @param userId - Twitch user ID the token belongs to.
 * @param token - The token in Twurple's format.
 */
export const saveTwitchToken = async (
  userId: string,
  token: AccessToken,
): Promise<void> => {
  try {
    await TokenModel.updateOne(
      { user_id: userId },
      { $set: toTokenFields(token) },
      { upsert: true },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: formatError(error) });
  }
};
