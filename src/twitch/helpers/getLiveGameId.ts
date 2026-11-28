import { helix } from '@/lib/clients';
import { logger } from '@/lib/logger';

/**
 * Get the Twitch category ID the broadcaster is currently streaming in.
 *
 * @param broadcasterId - The broadcaster's Twitch user ID.
 * @returns The category ID, or `null` if the channel is offline or the request fails.
 */
export const getLiveGameId = async (
  broadcasterId: string,
): Promise<string | null> => {
  try {
    const stream = await helix.streams.getStreamByUserId(broadcasterId);

    return stream?.gameId ?? null;
  } catch (error) {
    logger.error({ err: error, broadcasterId }, 'Failed to get live game ID');
    return null;
  }
};
