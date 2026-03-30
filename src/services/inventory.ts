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
    }).exec();

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
    const increments: Record<string, number> = {};
    const allowedBallKeys: Array<keyof BallInventory> = [
      'pokeball',
      'greatball',
      'ultraball',
      'masterball',
    ];

    allowedBallKeys.forEach(key => {
      const delta = ballUpdates[key];
      if (typeof delta === 'number' && delta !== 0) {
        increments[`balls.${key}`] = delta;
      }
    });

    if (!Object.keys(increments).length) {
      return await InventoryModel.findOne({ discord_id: discordId }).exec();
    }

    const inventory = await InventoryModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: increments },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();

    return inventory;
  } catch (error) {
    log({
      type: LogCode.Error,
      description: JSON.stringify(error),
    });
    return;
  }
};
