import { model, models, Schema } from 'mongoose';
import { User } from '@parthenonlab/types';
import { getENV } from '@/lib/config';

const { MONGODB_USERS } = getENV();

const userSchema = new Schema<User>(
  {
    user_id: { type: String, required: true },
    discord_id: { type: String, default: null },
    discord_username: { type: String, default: null },
    discord_name: { type: String, default: null },
    twitch_id: { type: String, default: null },
    twitch_username: { type: String, default: null },
    cash: { type: Number, required: true, default: 500 },
    bank: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
  },
  { collection: MONGODB_USERS, versionKey: false },
);

export const UserModel = models.User || model<User>('User', userSchema);
