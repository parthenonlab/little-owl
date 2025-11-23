import { GuildScheduledEvent } from 'discord.js';

import { CONFIG, DAY_MAP, EMOJIS } from '@/constants';
import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';

export const sendServerGreeting = async () => {
  const { SERVER_ID } = getENV();

  const server = discord.guilds.cache.get(SERVER_ID);

  if (server && server.available) {
    const channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.GENERAL);

    if (channel && channel.isTextBased()) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const d = now.getDate();

      const today = DAY_MAP[now.getDay()];
      const events = await server.scheduledEvents.fetch();

      const firstEventToday = events.reduce<GuildScheduledEvent | null>(
        (best, e) => {
          const start = e.scheduledStartAt;
          if (!start) return best;

          if (
            start.getFullYear() === y &&
            start.getMonth() === m &&
            start.getDate() === d
          ) {
            if (!best || start < best.scheduledStartAt!) return e;
          }
          return best;
        },
        null
      );

      let eventMessage = `Happy ${today}, everyone! ${EMOJIS.CUSTOM.ARRIVE}`;

      if (firstEventToday) {
        eventMessage += `\n### TODAY'S EVENT\n${firstEventToday.url}`;
      }

      await channel.send(eventMessage);
    }
  }
};
