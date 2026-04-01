import { Document } from 'mongoose';

interface BaseActivity {
  last_used: Date | null;
}

export interface BankActivity extends BaseActivity {}

export interface GambleActivity extends BaseActivity {
  total_wins: number;
  total_losses: number;
  total_won: number;
  total_lost: number;
  biggest_win: number;
}

export interface StarActivity extends BaseActivity {
  total_given: number;
}

export interface WordleActivity extends BaseActivity {}

export type ActivityFields = {
  bank: BankActivity;
  gamble: GambleActivity;
  star: StarActivity;
  wordle: WordleActivity;
};

export interface ActivityDocument extends Document {
  discord_id: string;
  bank?: ActivityFields['bank'];
  gamble?: ActivityFields['gamble'];
  star?: ActivityFields['star'];
  wordle?: ActivityFields['wordle'];
}
