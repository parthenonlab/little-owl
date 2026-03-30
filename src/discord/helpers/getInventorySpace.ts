import { InventoryDocument } from '@/interfaces/inventory';
import { getTotalBalls } from './getTotalBalls';

export const getInventorySpace = (inventory: InventoryDocument) => {
  return inventory.capacity - getTotalBalls(inventory.balls);
};
