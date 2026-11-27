import { model, Schema } from 'mongoose';

import { ShopState } from '@/interfaces/shop';
import { getENV } from '@/lib/config';

const { MONGODB_SHOP } = getENV();

const shopSchema = new Schema<ShopState>(
  {
    pokeball: { type: Number, required: true },
    greatball: { type: Number, required: true },
    ultraball: { type: Number, required: true },
    masterball: { type: Number, required: true },
  },
  { collection: MONGODB_SHOP, versionKey: false },
);

export const ShopModel = model<ShopState>('Shop', shopSchema);
