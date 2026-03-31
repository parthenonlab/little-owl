import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { StatDocument } from '@/interfaces/stat';
import { StatModel } from '@/models/stat';

/**
 * Delete the stats document for a Discord user.
 *
 * @param id - Discord user ID.
 * @returns The deleted stats document, or null if not found or on error.
 */
export const deleteStats = async (id: string): Promise<StatDocument | null> => {
  try {
    return await StatModel.findOneAndDelete({ discord_id: id });
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return null;
  }
};
