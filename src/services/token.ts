import { AccessToken } from '@twurple/auth';

import { logger } from '@/lib/logger';
import { fromTokenFields, toTokenFields } from '@/lib/utils';
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
    logger.error(
      { err: error, twitchId: userId },
      'Failed to get Twitch token',
    );
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
    logger.error(
      { err: error, twitchId: userId },
      'Failed to save Twitch token',
    );
  }
};
