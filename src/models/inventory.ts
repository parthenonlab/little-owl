import { model, Schema } from 'mongoose';

import { Inventory } from '@/interfaces/inventory';

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
  { collection: 'inventories', versionKey: false },
);

export const InventoryModel = model<Inventory>('Inventory', inventorySchema);
