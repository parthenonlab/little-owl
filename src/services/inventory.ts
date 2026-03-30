import { log } from '@/discord/helpers/log';
import { LogCode } from '@/enums/logs';

import { InventoryDocument, BallInventory } from '@/interfaces/inventory';
import { InventoryModel } from '@/models/inventory';

/**
 * Get or create inventory for a Discord user.
 *
 * @param discordId - Discord user id to look up inventory for.
 * @returns Inventory document, creates default on missing, or undefined on error.
 */
export const getInventory = async (
  discordId: string,
): Promise<InventoryDocument | undefined> => {
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
      description: JSON.stringify(error),
    });
    return;
  }
};

/**
 * Adjust ball counts in a user's inventory.
 *
 * @param discordId - Discord user id that owns the inventory.
 * @param ballUpdates - Ball deltas (positive to add, negative to remove).
 * @returns Updated inventory document or undefined on failure.
 */
export const updateBalls = async (
  discordId: string,
  ballUpdates: Partial<BallInventory>,
): Promise<InventoryDocument | undefined> => {
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
    );

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};

/**
 * Update a user's inventory capacity.
 *
 * @param discordId - Discord user id that owns the inventory.
 * @param newCapacity - New inventory capacity value (non-negative).
 * @returns Updated inventory document, created with defaults if needed, or undefined on error.
 */
export const updateCapacity = async (
  discordId: string,
): Promise<InventoryDocument | undefined> => {
  try {
    const inventory = await InventoryModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { capacity: 1 } },
      { new: true },
    );

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};
