import { InventoryDocument } from '@/interfaces/inventory';
import { getTotalBalls } from './getTotalBalls';

/**
 * Returns the number of available slots in the inventory.
 *
 * @param inventory - The user's inventory document.
 * @returns The number of open slots remaining.
 */
export const getInventorySpace = (inventory: InventoryDocument) => {
  return inventory.capacity - getTotalBalls(inventory.balls);
};
