import { CONFIG, DAY_MAP, EMOJIS } from '@/constants';

import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';

export const sendServerGreeting = async () => {
  const { SERVER_ID } = getENV();

  const server = discord.guilds.cache.get(SERVER_ID);

  if (server && server.available) {
    const channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.GENERAL);

    if (channel && channel.isTextBased()) {
      const today = DAY_MAP[new Date().getDay()];
      const events = await server.scheduledEvents.fetch();
      const firstEvent = events.first();

      let eventMessage = `Happy ${today}, everyone! ${EMOJIS.CUSTOM.ARRIVE}`;
      if (firstEvent) eventMessage += `\n### TODAY'S EVENT\n${firstEvent.url}`;

      await channel.send(eventMessage);
    }
  }
};
