# Development

## Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Run the bot in staging mode |
| `yarn dev:register` | Register Discord slash commands, then keep running in staging mode |
| `yarn start` | Run the bot in production mode |
| `yarn test` | Run the Jest tests |
| `yarn twitch:auth:staging` | Authorize the bot's Twitch account for the staging database |
| `yarn twitch:auth` | Authorize the bot's Twitch account for the production database |

## Staging vs Production

`STAGING=true` (set by the `dev` scripts) switches:

- **Database:** `MONGODB_DB_TEST` instead of `MONGODB_DB`
- **Browser:** profile cards use Puppeteer's bundled Chromium. Production expects a system Chromium at `/usr/lib/chromium/chromium`.
- **Discord:** skips the subscriber sync on startup and sets the bot's status to "IN DEV MODE"

Staging and production join the same Twitch channel. Stop the production bot before testing Twitch features locally, or both bots will reply to every command.

## Discord Commands

Enable developer mode in Discord (`Settings → Advanced → Developer Mode`) to copy server, channel, and user IDs.

New or changed slash commands must be registered. `yarn dev:register` registers:

- production commands to the community server (`SERVER_ID`)
- stage commands to the admin server (`ADMIN_SERVER_ID`)
- global commands application-wide

## Tests

Tests live in `src/__tests__/`, mirroring the source structure. Run them with `yarn test`.

## Type Checking

```bash
yarn tsc --noEmit
```

`tsconfig.json` uses `module`/`moduleResolution: nodenext`. Without `"type": "module"` in `package.json`, this still compiles to CommonJS, so extensionless imports, `index.ts` barrels, and `@/` paths work as usual.

TypeScript is pinned to 6.x: TypeScript 7 removes the compiler API that `ts-node` and `ts-jest` depend on. Moving to 7 means replacing them first (e.g. `tsx` and `@swc/jest`).
