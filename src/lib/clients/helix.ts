import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';

if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
  console.error('🦉 Error: Twurple Missing Environment Variables');
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
