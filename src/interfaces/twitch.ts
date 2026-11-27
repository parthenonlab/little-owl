export interface TwitchReminder {
  message: string;
  /** Twitch category ID; when set, the reminder is only sent while live in this category. */
  game?: string;
}
