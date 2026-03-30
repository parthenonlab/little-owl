import { model, models, Schema } from 'mongoose';

import { InventoryDocument } from '@/interfaces/inventory';
import { getENV } from '@/lib/config';

const { MONGODB_INVENTORY } = getENV();

const inventorySchema = new Schema<InventoryDocument>(
  {
    discord_id: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 5 },
    balls: {
      pokeball: { type: Number, default: 1 },
      greatball: { type: Number, default: 0 },
      ultraball: { type: Number, default: 0 },
      masterball: { type: Number, default: 0 },
    },
  },
  { collection: MONGODB_INVENTORY, versionKey: false },
);

export const InventoryModel =
  models.Inventory || model<InventoryDocument>('Inventory', inventorySchema);
