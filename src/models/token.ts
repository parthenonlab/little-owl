import { model, Schema } from 'mongoose';

import { TwitchToken } from '@/interfaces/token';
// Imported directly (not via the barrel) so scripts can use this model without starting the clients
import { getENV } from '@/lib/config/env';

const { MONGODB_TOKENS } = getENV();

const tokenSchema = new Schema<TwitchToken>(
  {
    user_id: { type: String, required: true, unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, default: null },
    scope: { type: [String], default: [] },
    expires_in: { type: Number, default: null },
    obtainment_timestamp: { type: Number, required: true },
  },
  { collection: MONGODB_TOKENS, versionKey: false },
);

export const TokenModel = model<TwitchToken>('Token', tokenSchema);
