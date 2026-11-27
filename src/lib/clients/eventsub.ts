import { EventSubWsListener } from '@twurple/eventsub-ws';

import { helix } from './helix';

/**
 * Opens one WebSocket per user token its subscriptions require (only the bot's).
 * Started in `init()` once the bot's token is loaded; stopped in `sleepTime()`.
 */
const eventsub = new EventSubWsListener({ apiClient: helix });

eventsub.onUserSocketConnect(() => {
  console.log('🦉 Little Owl: EventSub Connected');
});

eventsub.onUserSocketDisconnect((_userId, error) => {
  console.error(`🦉 Little Owl: EventSub Disconnected${error ? ` (${error.message})` : ''}`);
});

export { eventsub };
