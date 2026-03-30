import cron from 'node-cron';

import { BotState } from '@/interfaces/bot';

import {
  restockShopDaily,
  restockShopWeekly,
  sendServerGreeting,
  updateBotActivity,
} from '@/discord/helpers';

import { chatReminder } from '@/twitch/helpers';

export const scheduleTasks = (state: BotState) => {
  // Update the Discord bot activity every HH:00 and HH:30
  state.timers.push(
    cron.schedule('0,30 * * * *', async () => {
      await updateBotActivity(state);
    }),
  );

  // Send a daily Discord message every 7:00 AM
  state.timers.push(
    cron.schedule('0 7 * * *', async () => {
      await sendServerGreeting();
    }),
  );

  // Send a message in the Twitch channel every HH:00 and HH:30
  state.timers.push(
    cron.schedule('0,30 * * * *', async () => {
      await chatReminder(state);
    }),
  );

  state.timers.push(
    cron.schedule('0 0 * * *', async () => {
      await restockShopDaily(state);
    }),
  );

  state.timers.push(
    cron.schedule('0 0 * * 0', async () => {
      await restockShopWeekly(state);
    }),
  );

  console.log('🦉 Little Owl: Scheduled Tasks Added');
};
