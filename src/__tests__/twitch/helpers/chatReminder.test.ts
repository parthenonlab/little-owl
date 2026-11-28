jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/lib/clients', () => ({
  helix: { streams: { getStreamByUserId: jest.fn() } },
}));
jest.mock('@/twitch/helpers/say', () => ({ say: jest.fn() }));

import { CONFIG, COPY } from '@/constants';
import { log } from '@/discord/helpers';
import { helix } from '@/lib/clients';
import { chatReminder } from '@/twitch/helpers/chatReminder';
import { say } from '@/twitch/helpers/say';

import { makeBotState } from '../../fixtures';

const getStream = helix.streams.getStreamByUserId as jest.Mock;
const IDS = { botId: '143', broadcasterId: '999' };
const REMINDERS = COPY.TWITCH_REMINDERS;
const OVERWATCH = CONFIG.TWITCH_GAMES.OVERWATCH;

const firstIndex = (predicate: (game?: string) => boolean) =>
  REMINDERS.findIndex(r => predicate(r.game));

const makeState = (reminderIndex: number, twitchChatQueue = 11) =>
  makeBotState({ reminderIndex, twitch: IDS, twitchChatQueue });

describe('chatReminder', () => {
  const owIndex = firstIndex(game => game === OVERWATCH);
  const lastOwIndex = REMINDERS.map(r => r.game).lastIndexOf(OVERWATCH);

  beforeEach(() => {
    jest.clearAllMocks();
    getStream.mockResolvedValue(null);
  });

  it('does nothing when the chat queue is below 11', async () => {
    const state = makeState(0, 10);

    await chatReminder(state);

    expect(getStream).not.toHaveBeenCalled();
    expect(say).not.toHaveBeenCalled();
    expect(state).toEqual(makeState(0, 10));
  });

  it('sends the current reminder and advances the rotation', async () => {
    const state = makeState(0);

    await chatReminder(state);

    expect(getStream).toHaveBeenCalledWith('999');
    expect(say).toHaveBeenCalledWith(IDS, REMINDERS[0].message);
    expect(state).toEqual(makeState(1, 0));
  });

  it('skips an Overwatch reminder when the stream is offline', async () => {
    const state = makeState(owIndex);

    await chatReminder(state);

    const next = owIndex + 1;
    expect(say).toHaveBeenCalledWith(IDS, REMINDERS[next].message);
    expect(state).toEqual(makeState(next + 1, 0));
  });

  it('skips an Overwatch reminder when live in another category', async () => {
    getStream.mockResolvedValue({ gameId: '509658' });
    const state = makeState(owIndex);

    await chatReminder(state);

    expect(say).not.toHaveBeenCalledWith(IDS, REMINDERS[owIndex].message);
  });

  it('sends an Overwatch reminder when live in Overwatch', async () => {
    getStream.mockResolvedValue({ gameId: OVERWATCH });
    const state = makeState(owIndex);

    await chatReminder(state);

    expect(say).toHaveBeenCalledWith(IDS, REMINDERS[owIndex].message);
    expect(state).toEqual(makeState(owIndex + 1, 0));
  });

  it('wraps around the rotation when skipping past the end', async () => {
    const state = makeState(lastOwIndex);

    await chatReminder(state);

    const next = (lastOwIndex + 1) % REMINDERS.length;
    expect(say).toHaveBeenCalledWith(IDS, REMINDERS[next].message);
    expect(state.reminderIndex).toBe((next + 1) % REMINDERS.length);
  });

  it('logs and treats the stream as offline when the API call fails', async () => {
    getStream.mockRejectedValue(new Error('boom'));
    const state = makeState(owIndex);

    await chatReminder(state);

    expect(log).toHaveBeenCalled();
    expect(say).toHaveBeenCalledWith(IDS, REMINDERS[owIndex + 1].message);
  });
});
