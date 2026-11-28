import { EventSubWsListener } from '@twurple/eventsub-ws';

import { logger } from '@/lib/logger';

import { helix } from './helix';

/**
 * Opens one WebSocket per user token its subscriptions require (only the bot's).
 * Started in `init()` once the bot's token is loaded; stopped in `sleepTime()`.
 */
const eventsub = new EventSubWsListener({ apiClient: helix });

eventsub.onUserSocketConnect(() => {
  logger.info('EventSub connected');
});

eventsub.onUserSocketDisconnect((_userId, error) => {
  if (error) {
    logger.error({ err: error }, 'EventSub disconnected');
    return;
  }

  logger.warn('EventSub disconnected');
});

export { eventsub };
