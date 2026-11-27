import { BotState } from '@/interfaces/bot';

/**
 * `Partial<T>` without the Object built-ins that classes like discord.js override
 * with narrower types (e.g. `toString(): '<@id>'`), which plain object literals can't satisfy.
 */
type FakeFields<T> = Partial<Omit<T, 'constructor' | 'toJSON' | 'toString' | 'valueOf'>>;

/**
 * Build a typed stand-in for a class that can't be constructed in tests (e.g. Twurple events, discord.js objects).
 * Only the given fields exist; keys and value types are still checked against `T`.
 *
 * @param fields - The fields the code under test reads.
 * @returns The fields typed as `T`.
 */
export const fake = <T>(fields: FakeFields<T>): T => fields as T;

/**
 * Build a complete `BotState` with test defaults.
 *
 * @param overrides - Fields to replace on the default state.
 * @returns A full `BotState`.
 */
export const makeBotState = (overrides: Partial<BotState> = {}): BotState => ({
  activityIndex: 0,
  cooldowns: { stream: new Date(0) },
  exploreList: new Map(),
  reminderIndex: 0,
  shop: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 0 },
  timers: [],
  twitch: { botId: '143', broadcasterId: '999' },
  twitchChatQueue: 0,
  ...overrides,
});
