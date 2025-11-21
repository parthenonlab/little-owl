import { COPY } from '@/constants';
import { BotState } from '@/interfaces/bot';
import { discord } from '@/lib/clients';
import { ActivityType } from 'discord.js';

export const updateBotActivity = (state: BotState) => {
  if (state.activityIndex < COPY.ACTIVITIES.length) {
    discord.user?.setActivity({
      name: COPY.ACTIVITIES[state.activityIndex],
      type: ActivityType.Custom,
    });
    state.activityIndex += 1;
    if (state.activityIndex >= COPY.ACTIVITIES.length) state.activityIndex = 0;
  }
};
