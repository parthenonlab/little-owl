import { getPCBoxCapacity } from '@/discord/helpers/getPCBoxCapacity';

const makeUser = (
  overrides: Partial<{
    subscriber: boolean;
    discord_id: string;
    twitch_id: string;
    box_space: number;
  }> = {},
) => ({
  subscriber: false,
  discord_id: '',
  twitch_id: '',
  box_space: 0,
  ...overrides,
});

describe('getPCBoxCapacity', () => {
  it('returns 30 for a standard user with no bonuses', () => {
    expect(getPCBoxCapacity(makeUser())).toBe(30);
  });

  it('returns 300 for a subscriber', () => {
    expect(getPCBoxCapacity(makeUser({ subscriber: true }))).toBe(300);
  });

  it('adds 50 when both discord_id and twitch_id are set', () => {
    expect(
      getPCBoxCapacity(makeUser({ discord_id: 'abc', twitch_id: 'xyz' })),
    ).toBe(80);
  });

  it('does not add linked bonus with only discord_id', () => {
    expect(getPCBoxCapacity(makeUser({ discord_id: 'abc' }))).toBe(30);
  });

  it('does not add linked bonus with only twitch_id', () => {
    expect(getPCBoxCapacity(makeUser({ twitch_id: 'xyz' }))).toBe(30);
  });

  it('adds purchased box_space on top of base', () => {
    expect(getPCBoxCapacity(makeUser({ box_space: 10 }))).toBe(40);
  });

  it('stacks all bonuses', () => {
    expect(
      getPCBoxCapacity(
        makeUser({ subscriber: true, discord_id: 'abc', twitch_id: 'xyz', box_space: 25 }),
      ),
    ).toBe(375);
  });
});
