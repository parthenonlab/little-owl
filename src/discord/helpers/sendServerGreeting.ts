import { CONFIG, DAY_MAP, EMOJIS } from '@/constants';
import { discord } from '@/lib/clients';
import { getENV } from '@/lib/config';

const MAX_GREETING_EVENTS = 2;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Send a daily greeting message to the general channel, listing up to
 * `MAX_GREETING_EVENTS` of today's scheduled events in start-time order.
 */
export const sendServerGreeting = async () => {
  const { SERVER_ID } = getENV();

  const server = discord.guilds.cache.get(SERVER_ID);
  if (!server?.available) return;

  const channel = server.channels.cache.get(CONFIG.CHANNELS.MAIN.GENERAL);
  if (!channel?.isTextBased()) return;

  const now = new Date();
  const today = DAY_MAP[now.getDay()];
  const events = await server.scheduledEvents.fetch();

  const todayEvents = [...events.values()]
    .flatMap(event => {
      const start = event.scheduledStartAt;
      return start && isSameDay(start, now) ? [{ start, url: event.url }] : [];
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let eventMessage = `Happy ${today}, everyone! ${EMOJIS.CUSTOM.ARRIVE}`;

  if (todayEvents.length) {
    const shown = todayEvents.slice(0, MAX_GREETING_EVENTS);
    const remaining = todayEvents.length - shown.length;
    const header = todayEvents.length > 1 ? "TODAY'S EVENTS" : "TODAY'S EVENT";

    eventMessage += `\n### ${header}\n${shown.map(event => event.url).join('\n')}`;

    if (remaining) eventMessage += `\n...and ${remaining} more`;
  }

  await channel.send(eventMessage);
};
