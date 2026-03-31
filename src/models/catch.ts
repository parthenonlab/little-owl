import { model, models, Schema } from 'mongoose';

import { CatchDocument } from '@/interfaces/catch';
import { getENV } from '@/lib/config';

const { MONGODB_CATCHES } = getENV();

const catchSchema = new Schema<CatchDocument>(
  {
    catch_id: { type: String, required: true, unique: true },
    discord_id: { type: String, required: true },
    pokemon_id: { type: Number, required: true },
    gender: { type: String, default: null },
    variant: { type: String, required: true, default: 'normal' },
    shiny: { type: Boolean, required: true, default: false },
    ball_used: { type: String, required: true },
    favorite: { type: Boolean, default: false },
    caught_at: { type: Date, default: Date.now },
  },
  { collection: MONGODB_CATCHES, versionKey: false },
);

catchSchema.index({ discord_id: 1 });
catchSchema.index({ discord_id: 1, favorite: 1 });
catchSchema.index({ discord_id: 1, pokemon_id: 1 });

export const CatchModel =
  models.Catch || model<CatchDocument>('Catch', catchSchema);
