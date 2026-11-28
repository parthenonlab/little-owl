import cron from 'node-cron';

import {
  restockShopDaily,
  restockShopWeekly,
  sendServerGreeting,
  updateBotActivity,
} from '@/discord/helpers';

import { BotState } from '@/interfaces/bot';
import { logger, withErrorLogging } from '@/lib/logger';
import { chatReminder } from '@/twitch/helpers';

const safe = (task: string, fn: () => Promise<void>) =>
  withErrorLogging('Scheduled task failed', { task }, fn);

export const scheduleTasks = (state: BotState) => {
  // Update bot activity and send Twitch chat reminder every HH:00 and HH:30
  state.timers.push(
    cron.schedule(
      '0,30 * * * *',
      safe('activityAndReminder', async () => {
        updateBotActivity(state);
        await chatReminder(state);
      }),
    ),
  );

  // Send a daily Discord message every 7:00 AM
  state.timers.push(
    cron.schedule(
      '0 7 * * *',
      safe('serverGreeting', () => sendServerGreeting()),
    ),
  );

  // Restock pokeballs, greatballs, and ultraballs every day at midnight
  state.timers.push(
    cron.schedule(
      '0 0 * * *',
      safe('restockDaily', () => restockShopDaily(state)),
    ),
  );

  // Restock masterballs every Sunday at noon
  state.timers.push(
    cron.schedule(
      '0 12 * * 0',
      safe('restockWeekly', () => restockShopWeekly(state)),
    ),
  );

  logger.info('Scheduled tasks added');
};
