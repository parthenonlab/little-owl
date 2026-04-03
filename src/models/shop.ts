import { model, models, Schema } from 'mongoose';

import { ShopDocument } from '@/interfaces/shop';
import { getENV } from '@/lib/config';

const { MONGODB_SHOP } = getENV();

const shopSchema = new Schema<ShopDocument>(
  {
    pokeball: { type: Number, required: true },
    greatball: { type: Number, required: true },
    ultraball: { type: Number, required: true },
    masterball: { type: Number, required: true },
    lastDailyRestock: { type: Date, required: true },
    lastWeeklyRestock: { type: Date, required: true },
  },
  { collection: MONGODB_SHOP, versionKey: false },
);

export const ShopModel = models.Shop || model<ShopDocument>('Shop', shopSchema);
