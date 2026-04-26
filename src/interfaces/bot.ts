import { CommandInteraction } from 'discord.js';
import { ScheduledTask } from 'node-cron';

import { LogCode } from '@/enums/logs';

import { PokemonExplorePayload } from './pokemon';
import { ShopState } from './shop';

export interface BotState {
  activityIndex: number;
  cooldowns: {
    stream: Date;
  };
  exploreList: Map<string, PokemonExplorePayload>;
  reminderIndex: number;
  shop: ShopState;
  timers: ScheduledTask[];
  twitchChatQueue: number;
}

export interface LogProps {
  type: LogCode;
  title?: string;
  description: string;
  image?: string;
  authorIcon?: string;
  thumbnail?: string;
  footer?: string;
}

export interface ObjectProps {
  [key: string]: any;
}

export interface ReplyProps {
  content: string;
  ephemeral?: boolean;
  interaction: CommandInteraction;
}
