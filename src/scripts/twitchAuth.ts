/**
 * One-time OAuth for the bot's Twitch account. Saves the token to the `tokens` collection.
 * Run once per database: `yarn twitch:auth` (production) and `yarn twitch:auth:staging`.
 *
 * Imports are kept off the `@/lib/clients` and `@/lib/config` barrels so the Discord and EventSub clients don't start.
 */
require('dotenv').config();

import { randomBytes } from 'crypto';
import { stdin, stdout } from 'process';
import { createInterface } from 'readline/promises';

import { exchangeCode, getTokenInfo } from '@twurple/auth';
import mongoose from 'mongoose';

import { connectDatabase } from '@/lib/config/db';
import { toTokenFields } from '@/lib/utils/twitchToken';
import { TokenModel } from '@/models/token';

const SCOPES = [
  // Chat
  'user:read:chat',
  'user:write:chat',
  'user:bot',
  // channel.moderate v2 (bans and timeouts) as a moderator; v2 also requires the warnings scope
  'moderator:read:banned_users',
  'moderator:read:blocked_terms',
  'moderator:read:chat_messages',
  'moderator:read:chat_settings',
  'moderator:read:moderators',
  'moderator:read:unban_requests',
  'moderator:read:vips',
  'moderator:read:warnings',
];

const main = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;
  const username = process.env.USERNAME?.toLowerCase();

  if (!clientId || !clientSecret || !redirectUri || !username) {
    throw new Error(
      'Missing TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI, or USERNAME',
    );
  }

  const state = randomBytes(16).toString('hex');
  const authorizeUrl = new URL('https://id.twitch.tv/oauth2/authorize');

  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    force_verify: 'true',
  }).toString();

  console.log(`\n1. Open this URL in a private window, logged in as "${username}":\n`);
  console.log(authorizeUrl.toString());
  console.log('\n2. Authorize, then copy the full URL you are redirected to.\n');

  const rl = createInterface({ input: stdin, output: stdout });
  const pasted = await rl.question('Paste the redirect URL: ');
  rl.close();

  const redirected = new URL(pasted.trim());
  const params = redirected.searchParams;

  if (params.get('error')) {
    throw new Error(`Authorization denied: ${params.get('error_description')}`);
  }

  if (params.get('state') !== state) {
    throw new Error('State mismatch; restart the script and use the new URL');
  }

  const code = params.get('code');

  if (!code) throw new Error('No code found in the redirect URL');

  const token = await exchangeCode(clientId, clientSecret, code, redirectUri);
  const info = await getTokenInfo(token.accessToken, clientId);

  if (!info.userId || info.userName !== username) {
    throw new Error(
      `Authorized as "${info.userName}", expected "${username}". Nothing was saved.`,
    );
  }

  await connectDatabase();
  await TokenModel.updateOne(
    { user_id: info.userId },
    { $set: toTokenFields(token) },
    { upsert: true },
  );

  const database = process.env.STAGING ? 'staging' : 'production';
  console.log(`\n🦉 Saved token for ${info.userName} (${info.userId}) to ${database}.`);
};

main()
  .catch(error => {
    console.error(`\n🦉 Error: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
