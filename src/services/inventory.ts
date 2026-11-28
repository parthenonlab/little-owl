import { InventoryDocument, BallInventory } from '@/interfaces/inventory';
import { logger } from '@/lib/logger';
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
    logger.error(
      { err: error, discordId },
      'Failed to find or create inventory',
    );
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
    logger.error(
      { err: error, discordId, ballUpdates },
      'Failed to set inventory balls',
    );
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
    logger.error(
      { err: error, discordId },
      'Failed to increment inventory capacity',
    );
    return null;
  }
};
