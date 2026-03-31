import { Document } from 'mongoose';

export interface CatchDocument extends Document {
  catch_id: string;
  discord_id: string;
  pokemon_id: number;
  gender: string | null;
  variant: string;
  shiny: boolean;
  ball_used: string;
  favorite: boolean;
  caught_at: Date;
}
