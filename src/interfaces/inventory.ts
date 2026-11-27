import { HydratedDocument } from 'mongoose';

export interface BallInventory {
  pokeball: number;
  greatball: number;
  ultraball: number;
  masterball: number;
}

export interface Inventory {
  discord_id: string;
  capacity: number;
  balls: BallInventory;
}

export type InventoryDocument = HydratedDocument<Inventory>;
