import { HydratedDocument } from 'mongoose';

export interface ShopState {
  pokeball: number;
  greatball: number;
  ultraball: number;
  masterball: number;
}

export type ShopDocument = HydratedDocument<ShopState>;
