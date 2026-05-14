import { Document } from 'mongoose';

interface BaseActivity {
  last_used: Date | null;
}

export interface BankActivity extends BaseActivity {}
export interface GambleActivity extends BaseActivity {}
export interface WordleActivity extends BaseActivity {}

export interface StarActivity extends BaseActivity {
  total_given: number;
}

export interface ClaimActivity extends BaseActivity {}

export type ActivityFields = {
  bank: BankActivity;
  claim: ClaimActivity;
  gamble: GambleActivity;
  star: StarActivity;
  wordle: WordleActivity;
};

export interface ActivityDocument extends Document {
  discord_id: string;
  bank?: ActivityFields['bank'];
  claim?: ActivityFields['claim'];
  gamble?: ActivityFields['gamble'];
  star?: ActivityFields['star'];
  wordle?: ActivityFields['wordle'];
}
