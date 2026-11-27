import { model, Schema } from 'mongoose';

import { Inventory } from '@/interfaces/inventory';
import { getENV } from '@/lib/config';

const { MONGODB_INVENTORY } = getENV();

const inventorySchema = new Schema<Inventory>(
  {
    discord_id: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 5 },
    balls: {
      pokeball: { type: Number, default: 3 },
      greatball: { type: Number, default: 0 },
      ultraball: { type: Number, default: 0 },
      masterball: { type: Number, default: 0 },
    },
  },
  { collection: MONGODB_INVENTORY, versionKey: false },
);

export const InventoryModel = model<Inventory>('Inventory', inventorySchema);
