import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';

import { getENV } from '@/lib/config';

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = getENV();

/**
 * Uses the bot's user token once added via `initTwitchAuth()`, and an app token otherwise.
 */
const twitchAuth = new RefreshingAuthProvider({
  clientId: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_CLIENT_SECRET,
});

const helix = new ApiClient({ authProvider: twitchAuth });

export { helix, twitchAuth };
