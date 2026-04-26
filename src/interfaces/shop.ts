import { Document } from 'mongoose';

export interface ShopState {
  pokeball: number;
  greatball: number;
  ultraball: number;
  masterball: number;
}

export interface ShopDocument extends Document, ShopState {}
