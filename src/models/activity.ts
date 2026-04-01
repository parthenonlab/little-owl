import { model, models, Schema } from 'mongoose';

import { ActivityDocument } from '@/interfaces/activity';
import { getENV } from '@/lib/config';

const { MONGODB_ACTS } = getENV();

const activitySchema = new Schema<ActivityDocument>(
  {
    discord_id: { type: String, required: true, index: true },
    bank: {
      last_used: { type: Date, default: null },
    },
    gamble: {
      last_used: { type: Date, default: null },
      total_wins: { type: Number, default: 0 },
      total_losses: { type: Number, default: 0 },
      total_won: { type: Number, default: 0 },
      total_lost: { type: Number, default: 0 },
    },
    star: {
      last_used: { type: Date, default: null },
      total_given: { type: Number, default: 0 },
    },
    wordle: {
      last_used: { type: Date, default: null },
    },
  },
  { collection: MONGODB_ACTS, versionKey: false },
);

export const ActivityModel =
  models.Activity || model<ActivityDocument>('Activity', activitySchema);
