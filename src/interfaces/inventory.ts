import { Document } from 'mongoose';

export interface BallInventory {
  pokeball: number;
  greatball: number;
  ultraball: number;
  masterball: number;
}

export interface InventoryDocument extends Document {
  discord_id: string;
  capacity: number;
  balls: BallInventory;
}
