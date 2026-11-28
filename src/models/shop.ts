import { model, Schema } from 'mongoose';

import { ShopState } from '@/interfaces/shop';

const shopSchema = new Schema<ShopState>(
  {
    pokeball: { type: Number, required: true },
    greatball: { type: Number, required: true },
    ultraball: { type: Number, required: true },
    masterball: { type: Number, required: true },
  },
  { collection: 'shop', versionKey: false },
);

export const ShopModel = model<ShopState>('Shop', shopSchema);
