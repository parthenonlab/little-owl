import { Inventory } from '@/interfaces/inventory';

import { getTotalBalls } from './getTotalBalls';

/**
 * Returns the number of available slots in the inventory.
 *
 * @param inventory - The user's inventory capacity and balls.
 * @returns The number of open slots remaining.
 */
export const getInventorySpace = (
  inventory: Pick<Inventory, 'capacity' | 'balls'>,
) => {
  return inventory.capacity - getTotalBalls(inventory.balls);
};
