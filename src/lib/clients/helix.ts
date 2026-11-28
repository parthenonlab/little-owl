import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';

import { logger } from '@/lib/logger';

if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
  logger.fatal('Twurple missing environment variables');
  process.exit(1);
}

/**
 * Uses the bot's user token once added via `initTwitchAuth()`, and an app token otherwise.
 */
const twitchAuth = new RefreshingAuthProvider({
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
});

const helix = new ApiClient({ authProvider: twitchAuth });

export { helix, twitchAuth };
