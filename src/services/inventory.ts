import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';
import { InventoryDocument, BallInventory } from '@/interfaces/inventory';
import { formatError } from '@/lib/utils';
import { InventoryModel } from '@/models/inventory';

/**
 * Get or create inventory for a Discord user.
 *
 * @param discordId - Discord user id to look up inventory for.
 * @returns Inventory document, creates default on missing, or null on error.
 */
export const findOrCreateInventory = async (
  discordId: string,
): Promise<InventoryDocument | null> => {
  try {
    let inventory = await InventoryModel.findOne({
      discord_id: discordId,
    });

    if (!inventory) {
      inventory = new InventoryModel({
        discord_id: discordId,
      });

      await inventory.save();
    }

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: formatError(error),
    });
    return null;
  }
};

/**
 * Adjust ball counts in a user's inventory.
 *
 * @param discordId - Discord user id that owns the inventory.
 * @param ballUpdates - Updated values for ball counts.
 * @returns Updated inventory document or null on failure.
 */
export const setInventoryBalls = async (
  discordId: string,
  ballUpdates: Partial<BallInventory>,
): Promise<InventoryDocument | null> => {
  try {
    const updatedBallValues: Record<string, number> = {};

    Object.entries(ballUpdates).forEach(([key, value]) => {
      if (typeof value === 'number' && value >= 0) {
        updatedBallValues[`balls.${key}`] = value;
      }
    });

    const inventory = await InventoryModel.findOneAndUpdate(
      { discord_id: discordId },
      { $set: updatedBallValues },
      { returnDocument: 'after' },
    );

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: formatError(error),
    });
    return null;
  }
};

/**
 * Increment a user's inventory capacity by 1.
 *
 * @param discordId - Discord user ID that owns the inventory.
 * @returns Updated inventory document or null on error.
 */
export const incInventoryCapacity = async (
  discordId: string,
): Promise<InventoryDocument | null> => {
  try {
    const inventory = await InventoryModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { capacity: 1 } },
      { returnDocument: 'after' },
    );

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: formatError(error),
    });
    return null;
  }
};
