import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { helix } from '@/lib/clients';
import { formatError } from '@/lib/utils';

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
    log({ type: LogCode.Error, description: formatError(error) });
    return null;
  }
};
