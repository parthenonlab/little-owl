import { StatsDocument, StatsModel } from '@parthenonlab/models';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

/**
 * Delete the stats document for a Discord user.
 *
 * @param id - Discord user ID.
 * @returns The deleted stats document, or null if not found or on error.
 */
export const deleteStats = async (id: string): Promise<StatsDocument | null> => {
  try {
    return await StatsModel.findOneAndDelete({ discord_id: id });
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};
