import { StatsDocument, StatsModel } from '@parthenonlab/models';
import { GambleStats } from '@parthenonlab/types';

import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';

/**
 * Delete the stats document for a Discord user.
 *
 * @param id - Discord user ID.
 * @returns The deleted stats document, or null if not found or on error.
 */
export const deleteStats = async (
  id: string,
): Promise<StatsDocument | null> => {
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

/**
 * Save gambling stats for a Discord user.
 *
 * @param id - Discord user ID.
 * @param payload - The result of the gamble.
 * @returns The updated stats document, or null on error.
 */
export const saveGambleStats = async (
  id: string,
  { won, wager }: { won: boolean; wager: number },
): Promise<StatsDocument | null> => {
  try {
    const inc: Partial<GambleStats> = { totalPlays: 1 };
    const max: Partial<GambleStats> = won
      ? { maxWin: wager }
      : { maxLoss: wager };

    const toGmb = (fields: Partial<GambleStats>) =>
      Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [`gmb.${k}`, v]),
      );

    return await StatsModel.findOneAndUpdate(
      { discord_id: id },
      { $inc: toGmb(inc), $max: toGmb(max) },
      { new: true, upsert: true },
    );
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};
