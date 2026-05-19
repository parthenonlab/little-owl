jest.mock('@/lib/clients', () => ({
  discord: { guilds: { cache: { get: jest.fn(() => undefined) } } },
  twitch: {},
}));
jest.mock('@/lib/config', () => ({ getENV: jest.fn(() => ({ SERVER_ID: '' })) }));
jest.mock('@/services/shop', () => ({ updateShopStock: jest.fn() }));

import { restockShopDaily, restockShopWeekly } from '@/discord/helpers/restockShop';
import { BotState } from '@/interfaces/bot';

const makeState = (overrides: Partial<BotState['shop']> = {}): BotState =>
  ({
    shop: {
      pokeball: 0,
      greatball: 0,
      ultraball: 0,
      masterball: 0,
      ...overrides,
    },
  }) as unknown as BotState;

describe('restockShopDaily', () => {
  it('resets pokeball, greatball, and ultraball to default quantities', () => {
    const state = makeState();
    restockShopDaily(state);
    expect(state.shop.pokeball).toBe(250);
    expect(state.shop.greatball).toBe(100);
    expect(state.shop.ultraball).toBe(50);
  });

  it('does not touch masterball stock', () => {
    const state = makeState({ masterball: 5 });
    restockShopDaily(state);
    expect(state.shop.masterball).toBe(5);
  });
});

describe('restockShopWeekly', () => {
  it('resets masterball to 1', () => {
    const state = makeState({ masterball: 0 });
    restockShopWeekly(state);
    expect(state.shop.masterball).toBe(1);
  });

  it('does not touch other ball stocks', () => {
    const state = makeState({ pokeball: 100, greatball: 50, ultraball: 25 });
    restockShopWeekly(state);
    expect(state.shop.pokeball).toBe(100);
    expect(state.shop.greatball).toBe(50);
    expect(state.shop.ultraball).toBe(25);
  });
});
