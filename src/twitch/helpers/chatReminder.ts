import { COPY } from '@/constants';
import { BotState } from '@/interfaces/bot';

import { getLiveGameId } from './getLiveGameId';
import { say } from './say';

/**
 * Send a rotating reminder message to the Twitch channel if enough chat activity has occurred.
 * Only sends when the chat queue reaches 11 messages, then resets the counter.
 * Reminders tied to a game are skipped unless the stream is live in that category.
 *
 * @param state - The current bot state containing the chat queue count and reminder index.
 */
export const chatReminder = async (state: BotState) => {
  if (state.twitchChatQueue < 11) return;

  const liveGameId = await getLiveGameId(state.twitch.broadcasterId);
  const reminders = COPY.TWITCH_REMINDERS;

  for (let offset = 0; offset < reminders.length; offset++) {
    const index = (state.reminderIndex + offset) % reminders.length;
    const reminder = reminders[index];

    if (reminder.game && reminder.game !== liveGameId) continue;

    await say(state.twitch, reminder.message);
    state.twitchChatQueue = 0;
    state.reminderIndex = (index + 1) % reminders.length;
    return;
  }
};
