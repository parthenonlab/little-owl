/**
 * Get the inventory upgrade price for the next capacity tier.
 *
 * @param capacity - Current inventory capacity.
 * @returns Upgrade price in in-game currency.
 */
export const getUpgradePrice = (capacity: number): number => {
  if (capacity >= 30) return 0;

  const tiers: Array<{ min: number; price: number }> = [
    { min: 25, price: 1500 },
    { min: 20, price: 1250 },
    { min: 15, price: 1000 },
    { min: 10, price: 750 },
  ];

  const match = tiers.find(tier => capacity >= tier.min);
  if (match) return match.price;

  return 500;
};
