import { InventoryDocument } from '@/interfaces/inventory';
import { getTotalBalls } from './getTotalBalls';

/**
 * Check if inventory has space for at least one more ball.
 *
 * @param inventory - Inventory document with balls and capacity.
 * @returns True when current ball count is less than capacity.
 */
export const hasInventoryCapacity = (inventory: InventoryDocument): boolean => {
  return getTotalBalls(inventory.balls) < inventory.capacity;
};
