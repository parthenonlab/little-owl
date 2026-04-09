import cron from 'node-cron';

import { BotState } from '@/interfaces/bot';

import {
  restockShopDaily,
  restockShopWeekly,
  sendServerGreeting,
  updateBotActivity,
} from '@/discord/helpers';

import { LogCode } from '@/enums/logs';
import { log } from '@/discord/helpers';

import { chatReminder } from '@/twitch/helpers';

const safe = (fn: () => Promise<void>) => async () => {
  try {
    await fn();
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
  }
};

export const scheduleTasks = (state: BotState) => {
  // Update bot activity and send Twitch chat reminder every HH:00 and HH:30
  state.timers.push(
    cron.schedule('0,30 * * * *', safe(async () => {
      updateBotActivity(state);
      chatReminder(state);
    })),
  );

  // Send a daily Discord message every 7:00 AM
  state.timers.push(
    cron.schedule('0 7 * * *', safe(() => sendServerGreeting())),
  );

  // Restock pokeballs, greatballs, and ultraballs every day at midnight
  state.timers.push(
    cron.schedule('0 0 * * *', safe(() => restockShopDaily(state))),
  );

  // Restock masterballs every Sunday at noon
  state.timers.push(
    cron.schedule('0 12 * * 0', safe(() => restockShopWeekly(state))),
  );

  console.log('🦉 Little Owl: Scheduled Tasks Added');
};
