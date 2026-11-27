import { AccessToken } from '@twurple/auth';

import { TwitchToken } from '@/interfaces/token';

/**
 * Convert a Twurple access token to the snake_case fields stored in MongoDB.
 *
 * @param token - The token in Twurple's format.
 * @returns The token fields, excluding `user_id`.
 */
export const toTokenFields = (
  token: AccessToken,
): Omit<TwitchToken, 'user_id'> => ({
  access_token: token.accessToken,
  refresh_token: token.refreshToken,
  scope: token.scope,
  expires_in: token.expiresIn,
  obtainment_timestamp: token.obtainmentTimestamp,
});

/**
 * Convert a stored token document to Twurple's access token format.
 *
 * @param token - The stored token fields.
 * @returns The token in Twurple's format.
 */
export const fromTokenFields = (token: TwitchToken): AccessToken => ({
  accessToken: token.access_token,
  refreshToken: token.refresh_token,
  scope: token.scope,
  expiresIn: token.expires_in,
  obtainmentTimestamp: token.obtainment_timestamp,
});
