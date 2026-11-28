# Setup

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) and [yarn](https://classic.yarnpkg.com/)
- Node.js from `.nvmrc` (run `nvm use`). The bot refuses to start on Node versions below 22.
- Access to the MongoDB cluster, the Discord application, and the Twitch application (ask Athena)

## Install

```bash
git clone git@github.com:devthena/little-owl.git
cd little-owl
git checkout stage
nvm use
yarn install
```

## Environment Variables

Create a `.env` file in the project root. Ask Athena for the values.

### MongoDB

| Variable          | Description                                       |
| ----------------- | ------------------------------------------------- |
| `MONGODB_URL`     | Cluster connection URL, without the database name |
| `MONGODB_DB`      | Production database name                          |
| `MONGODB_DB_TEST` | Staging database name, used when `STAGING=true`   |

### Discord

| Variable            | Description                                       |
| ------------------- | ------------------------------------------------- |
| `DISCORD_TOKEN`     | Bot token                                         |
| `DISCORD_CLIENT_ID` | Application ID                                    |
| `SERVER_ID`         | Community server ID                               |
| `ADMIN_SERVER_ID`   | Admin server ID (log channels and stage commands) |

Discord channel and role IDs are not environment variables. They are hardcoded in `src/constants/config.ts`.

### Twitch

| Variable               | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `USERNAME`             | The bot account's Twitch login                                                      |
| `CHANNELS`             | The broadcaster's Twitch login (only the first entry is used)                       |
| `TWITCH_CLIENT_ID`     | Twitch application client ID                                                        |
| `TWITCH_CLIENT_SECRET` | Twitch application client secret                                                    |
| `TWITCH_REDIRECT_URI`  | OAuth redirect URL; only needed to run `yarn twitch:auth` (see [Twitch](twitch.md)) |

### Feature Flags

Each feature is enabled only when its variable is set to `true`:

`FEATURE_BONUS`, `FEATURE_CLAIM`, `FEATURE_COINFLIP`, `FEATURE_EXPLORE`, `FEATURE_FIXVX`, `FEATURE_GAMBLE`, `FEATURE_GIVE`, `FEATURE_HELP`, `FEATURE_INVENTORY`, `FEATURE_LEADERBOARD`, `FEATURE_LINK`, `FEATURE_PCBOX`, `FEATURE_POINTS`, `FEATURE_POKEDEX`, `FEATURE_PROFILE`, `FEATURE_SHOP`, `FEATURE_SLEEP`, `FEATURE_STAR`

## First Run

1. Authorize the bot's Twitch account for the staging database: `yarn twitch:auth:staging` (see [Twitch](twitch.md))
2. Run `yarn dev`

Without a Twitch token the bot still starts, but Twitch features stay disabled.
