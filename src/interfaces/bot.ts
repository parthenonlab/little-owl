import { CommandInteraction } from 'discord.js';
import { ScheduledTask } from 'node-cron';

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
  twitch: TwitchIds;
  twitchChatQueue: number;
}

export interface TwitchIds {
  botId: string;
  broadcasterId: string;
}

/**
 * Discord audit log channels. Errors aren't a log type: they go through the app logger,
 * which forwards them to the errors channel.
 */
export type LogType =
  'accounts' | 'members' | 'messages' | 'moderation' | 'twitchNotifications';

export type Platform = 'discord' | 'twitch';

interface BaseLogProps {
  title?: string;
  description: string;
  image?: string;
  authorIcon?: string;
  thumbnail?: string;
  footer?: string;
}

/** Moderation covers both platforms, so it must say which one. */
export type LogProps = BaseLogProps &
  (
    | { type: 'moderation'; platform: Platform }
    | { type: Exclude<LogType, 'moderation'>; platform?: never }
  );

/** An embed for the errors channel. Only sent by the error forwarder. */
export type ErrorLogProps = BaseLogProps;

export interface ReplyProps {
  content: string;
  ephemeral?: boolean;
  interaction: CommandInteraction;
}
