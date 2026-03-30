import { BallInventory } from '@/interfaces/inventory';

/**
 * Calculate the total number of balls in inventory.
 *
 * @param balls - Ball inventory counts by type.
 * @returns Total number of balls.
 */
export const getTotalBalls = (balls: BallInventory): number => {
  return balls.pokeball + balls.greatball + balls.ultraball + balls.masterball;
};
