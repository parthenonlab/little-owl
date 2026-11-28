# Twitch

Little Owl uses [Twurple](https://twurple.js.org/) for Twitch:

- **Reading:** EventSub over WebSocket. The bot subscribes to `channel.chat.message`, `channel.chat.notification` (subs, resubs, gifts, raids), and `channel.moderate` (bans, unbans, timeouts, untimeouts, message deletions).
- **Sending:** the Helix Send Chat Message API with an app token, so messages show the Chat Bot badge. Chat commands like `/me` aren't supported.

Everything runs on the bot account's token, so **the bot account must be a moderator in the channel**.

## Twitch Application

The app is registered in the [Twitch Developer Console](https://dev.twitch.tv/console) (category: Chat Bot, client type: Confidential). Its client ID and secret go in `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.

The OAuth redirect URL registered there must match `TWITCH_REDIRECT_URI` exactly: same protocol, port, and trailing slash. Nothing needs to be listening at that URL.

## Authorizing the Bot

The bot's OAuth token is stored in MongoDB (`tokens` collection) and refreshed automatically. Each database needs its own token, so authorize once per database:

```bash
yarn twitch:auth:staging   # staging database
yarn twitch:auth           # production database
```

1. Open the printed URL in a **private window** logged in as the bot account (not the broadcaster)
2. Authorize the app
3. Your browser will fail to load the redirect page. That's expected. Copy the full URL from the address bar and paste it into the terminal.

The script refuses to save a token for any account other than `USERNAME`.

Re-run it when:

- the scopes in `src/scripts/twitchAuth.ts` change
- the bot logs a "Twitch token refresh failed" error (for example, after the bot account's password changes or the app is disconnected)

## Scopes

| Scope                                                                                                                                                                                                                                         | Used for                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `user:read:chat`                                                                                                                                                                                                                              | Reading chat messages and notifications                                                                   |
| `user:write:chat`, `user:bot`                                                                                                                                                                                                                 | Sending chat messages with the Chat Bot badge                                                             |
| `moderator:read:banned_users`, `moderator:read:blocked_terms`, `moderator:read:chat_messages`, `moderator:read:chat_settings`, `moderator:read:moderators`, `moderator:read:unban_requests`, `moderator:read:vips`, `moderator:read:warnings` | `channel.moderate` v2 (bans, unbans, timeouts, untimeouts, message deletions), which requires all of them |

## Stream Status

The chat reminder checks whether the stream is live and in which category by polling the Helix API, at most once per reminder. EventSub's stream online/offline and channel update events would need the broadcaster's own token, so they aren't used.

## Subscriber Months

There's no API that returns a user's total subscribed months on demand. `sub_months` is updated from:

- the subscriber badge on each chat message (only ever increased)
- `cumulativeMonths` on resub notifications
- new subs and gift subs, which set it to at least 1

## Troubleshooting

| Symptom                                                    | Cause and fix                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `redirect_mismatch` during authorization                   | `TWITCH_REDIRECT_URI` doesn't exactly match the URL in the Developer Console    |
| `403 subscription missing proper authorization` on startup | The stored token is missing a scope. Re-run `yarn twitch:auth` (or `:staging`). |
| `Twitch Disabled — No Twitch token stored` on startup      | No token in this database. Run the auth script for it.                          |
| Bot replies twice to commands                              | Staging and production are both running                                         |
