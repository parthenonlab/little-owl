import { model, Schema } from 'mongoose';

import { TwitchToken } from '@/interfaces/token';

const tokenSchema = new Schema<TwitchToken>(
  {
    user_id: { type: String, required: true, unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, default: null },
    scope: { type: [String], default: [] },
    expires_in: { type: Number, default: null },
    obtainment_timestamp: { type: Number, required: true },
  },
  { collection: 'tokens', versionKey: false },
);

export const TokenModel = model<TwitchToken>('Token', tokenSchema);
