jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/services/user', () => ({
  findOrCreateTwitchUser: jest.fn(),
  getTwitchUserByName: jest.fn(),
  incTwitchUser: jest.fn(),
  setTwitchUser: jest.fn(),
}));
jest.mock('@/twitch/commands', () => ({
  onBonus: jest.fn(),
  onGamble: jest.fn(),
  onGive: jest.fn(),
}));
jest.mock('@/twitch/helpers/say', () => ({ say: jest.fn() }));

import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base';

import { CONFIG } from '@/constants';
import { log } from '@/discord/helpers';

import {
  findOrCreateTwitchUser,
  getTwitchUserByName,
  incTwitchUser,
  setTwitchUser,
} from '@/services/user';

import { onBonus, onGamble, onGive } from '@/twitch/commands';
import { onChat } from '@/twitch/events/chat';
import { say } from '@/twitch/helpers/say';

import { fake, makeBotState } from '../../fixtures';

const IDS = { botId: '143', broadcasterId: '999' };
const USER = { cash: 50, sub_months: 3 };

const makeEvent = (
  overrides: Partial<EventSubChannelChatMessageEvent> = {},
  subMonths: string | null = null,
) =>
  fake<EventSubChannelChatMessageEvent>({
    broadcasterId: '999',
    chatterId: '123',
    chatterName: 'owlfan',
    chatterDisplayName: 'OwlFan',
    messageText: 'hello there everyone',
    isCheer: false,
    bits: 0,
    rewardId: null,
    getBadgeInfo: (name: string) => (name === 'subscriber' ? subMonths : null),
    ...overrides,
  });

const makeState = () => makeBotState({ twitch: IDS });

describe('onChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (findOrCreateTwitchUser as jest.Mock).mockResolvedValue(USER);
  });

  it('ignores the bot itself', async () => {
    await onChat(makeState(), makeEvent({ chatterId: IDS.botId }));

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
  });

  it('ignores users on the ignore list', async () => {
    await onChat(makeState(), makeEvent({ chatterName: 'nightbot' }));

    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
  });

  it('logs cheers without counting them as chat', async () => {
    const state = makeState();

    await onChat(state, makeEvent({ isCheer: true, bits: 100 }));

    expect((log as jest.Mock).mock.calls[0][0].description).toContain(
      'owlfan cheered 100',
    );
    expect(findOrCreateTwitchUser).not.toHaveBeenCalled();
    expect(state.twitchChatQueue).toBe(0);
  });

  it('updates sub months from the subscriber badge when higher', async () => {
    await onChat(makeState(), makeEvent({}, '7'));

    expect(setTwitchUser).toHaveBeenCalledWith('123', { sub_months: 7 });
  });

  it('does not lower sub months', async () => {
    await onChat(makeState(), makeEvent({}, '2'));

    expect(setTwitchUser).not.toHaveBeenCalled();
  });

  it('converts a known channel point redemption to cash', async () => {
    const state = makeState();

    await onChat(
      state,
      makeEvent({ rewardId: CONFIG.TWITCH_REWARDS.REDEEM500 }),
    );

    expect(incTwitchUser).toHaveBeenCalledWith('123', 'cash', 500);
    expect(state.twitchChatQueue).toBe(0);
  });

  it('ignores unknown redemptions', async () => {
    await onChat(makeState(), makeEvent({ rewardId: 'other-reward' }));

    expect(incTwitchUser).not.toHaveBeenCalled();
  });

  it('replies to !points with the balance', async () => {
    await onChat(makeState(), makeEvent({ messageText: '!points' }));

    expect(say).toHaveBeenCalledWith(
      IDS,
      expect.stringContaining('OwlFan you have 50'),
    );
  });

  it('replies to !lurk without the unsupported /me prefix', async () => {
    await onChat(makeState(), makeEvent({ messageText: '!lurk' }));

    const message = (say as jest.Mock).mock.calls[0][1];
    expect(message.startsWith('OwlFan has disappeared')).toBe(true);
  });

  it('passes !gamble args to the gamble command', async () => {
    await onChat(makeState(), makeEvent({ messageText: '!gamble 10' }));

    expect(onGamble).toHaveBeenCalledWith(IDS, USER, ['10']);
  });

  it('ignores recipient commands without an argument', async () => {
    await expect(
      onChat(makeState(), makeEvent({ messageText: '!hug' })),
    ).resolves.toBeUndefined();

    expect(say).not.toHaveBeenCalled();
  });

  it('passes !give to the give command', async () => {
    const recipient = { twitch_id: '456' };
    (getTwitchUserByName as jest.Mock).mockResolvedValue(recipient);

    await onChat(makeState(), makeEvent({ messageText: '!give @friend 5' }));

    expect(getTwitchUserByName).toHaveBeenCalledWith('friend');
    expect(onGive).toHaveBeenCalledWith(IDS, USER, recipient, 5);
  });

  it('only lets the broadcaster use !bonus', async () => {
    const recipient = { twitch_id: '456' };
    (getTwitchUserByName as jest.Mock).mockResolvedValue(recipient);

    await onChat(makeState(), makeEvent({ messageText: '!bonus @friend 5' }));
    expect(onBonus).not.toHaveBeenCalled();

    await onChat(
      makeState(),
      makeEvent({ chatterId: '999', messageText: '!bonus @friend 5' }),
    );
    expect(onBonus).toHaveBeenCalledWith(IDS, recipient, 5);
  });

  it('counts chat messages and awards cash for valid ones', async () => {
    const state = makeState();

    await onChat(state, makeEvent());

    expect(state.twitchChatQueue).toBe(1);
    expect(incTwitchUser).toHaveBeenCalledWith('123', 'cash', 1);
  });

  it('counts short messages without awarding cash', async () => {
    const state = makeState();

    await onChat(state, makeEvent({ messageText: 'hi' }));

    expect(state.twitchChatQueue).toBe(1);
    expect(incTwitchUser).not.toHaveBeenCalled();
  });
});
