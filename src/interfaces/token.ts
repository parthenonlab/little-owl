import { HydratedDocument } from 'mongoose';

export interface TwitchToken {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  scope: string[];
  expires_in: number | null;
  obtainment_timestamp: number;
}

export type TwitchTokenDocument = HydratedDocument<TwitchToken>;
