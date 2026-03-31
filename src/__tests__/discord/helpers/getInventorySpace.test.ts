import { getInventorySpace } from '@/discord/helpers/getInventorySpace';
import { InventoryDocument } from '@/interfaces/inventory';

const makeInventory = (capacity: number, pokeball: number, greatball = 0, ultraball = 0, masterball = 0) =>
  ({ capacity, balls: { pokeball, greatball, ultraball, masterball } } as unknown as InventoryDocument);

describe('getInventorySpace', () => {
  it('returns remaining space', () => {
    expect(getInventorySpace(makeInventory(10, 3, 2))).toBe(5);
  });

  it('returns 0 when inventory is full', () => {
    expect(getInventorySpace(makeInventory(10, 10))).toBe(0);
  });

  it('returns full capacity when inventory is empty', () => {
    expect(getInventorySpace(makeInventory(10, 0))).toBe(10);
  });

  it('accounts for all ball types', () => {
    expect(getInventorySpace(makeInventory(20, 5, 5, 5, 1))).toBe(4);
  });
});
