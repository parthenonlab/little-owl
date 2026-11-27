jest.mock('@/lib/clients', () => ({
  discord: { guilds: { cache: { get: jest.fn() } } },
}));
jest.mock('@/lib/config', () => ({
  getENV: jest.fn(() => ({ SERVER_ID: 'server' })),
}));

import { CONFIG, DAY_MAP } from '@/constants';
import { sendServerGreeting } from '@/discord/helpers/sendServerGreeting';
import { discord } from '@/lib/clients';

const getGuild = discord.guilds.cache.get as jest.Mock;
const NOW = new Date(2026, 10, 27, 7, 0, 0); // Friday, 7:00 local

const makeEvent = (url: string, start: Date | null) => ({
  url,
  scheduledStartAt: start,
});

const setup = ({
  available = true,
  textBased = true,
  hasChannel = true,
  events = [] as ReturnType<typeof makeEvent>[],
} = {}) => {
  const send = jest.fn();
  const channel = { isTextBased: () => textBased, send };
  const getChannel = jest.fn((id: string) =>
    hasChannel && id === CONFIG.CHANNELS.MAIN.GENERAL ? channel : undefined,
  );

  getGuild.mockReturnValue({
    available,
    channels: { cache: { get: getChannel } },
    scheduledEvents: { fetch: jest.fn().mockResolvedValue(events) },
  });

  return { send };
};

describe('sendServerGreeting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => jest.useRealTimers());

  const greeting = `Happy ${DAY_MAP[NOW.getDay()]}, everyone!`;

  it('does nothing when the server is missing', async () => {
    getGuild.mockReturnValue(undefined);

    await expect(sendServerGreeting()).resolves.toBeUndefined();
  });

  it('does nothing when the server is unavailable', async () => {
    const { send } = setup({ available: false });

    await sendServerGreeting();

    expect(send).not.toHaveBeenCalled();
  });

  it('does nothing when the general channel is missing', async () => {
    const { send } = setup({ hasChannel: false });

    await sendServerGreeting();

    expect(send).not.toHaveBeenCalled();
  });

  it('does nothing when the general channel is not text-based', async () => {
    const { send } = setup({ textBased: false });

    await sendServerGreeting();

    expect(send).not.toHaveBeenCalled();
  });

  it('sends the greeting without an event section when none are today', async () => {
    const { send } = setup({
      events: [
        makeEvent('https://tomorrow', new Date(2026, 10, 28, 9)),
        makeEvent('https://unscheduled', null),
      ],
    });

    await sendServerGreeting();

    const message = send.mock.calls[0][0];
    expect(message).toContain(greeting);
    expect(message).not.toContain("TODAY'S EVENT");
  });

  it('lists a single event under a singular header', async () => {
    const { send } = setup({
      events: [makeEvent('https://morning', new Date(2026, 10, 27, 9))],
    });

    await sendServerGreeting();

    const message = send.mock.calls[0][0];
    expect(message).toContain(greeting);
    expect(message).toContain("### TODAY'S EVENT\nhttps://morning");
    expect(message).not.toContain('more');
  });

  it("lists today's events in start order under a plural header", async () => {
    const { send } = setup({
      events: [
        makeEvent('https://noon', new Date(2026, 10, 27, 12)),
        makeEvent('https://yesterday', new Date(2026, 10, 26, 8)),
        makeEvent('https://morning', new Date(2026, 10, 27, 9)),
      ],
    });

    await sendServerGreeting();

    expect(send.mock.calls[0][0]).toContain(
      "### TODAY'S EVENTS\nhttps://morning\nhttps://noon",
    );
    expect(send.mock.calls[0][0]).not.toContain('yesterday');
  });

  it('caps the list at 2 and counts the rest', async () => {
    const { send } = setup({
      events: [
        makeEvent('https://evening', new Date(2026, 10, 27, 20)),
        makeEvent('https://morning', new Date(2026, 10, 27, 9)),
        makeEvent('https://night', new Date(2026, 10, 27, 22)),
        makeEvent('https://noon', new Date(2026, 10, 27, 12)),
      ],
    });

    await sendServerGreeting();

    const message = send.mock.calls[0][0];
    expect(message).toContain(
      "### TODAY'S EVENTS\nhttps://morning\nhttps://noon\n...and 2 more",
    );
    expect(message).not.toContain('https://evening');
    expect(message).not.toContain('https://night');
  });

  it('keeps the listed order for events starting at the same time', async () => {
    const { send } = setup({
      events: [
        makeEvent('https://first', new Date(2026, 10, 27, 9)),
        makeEvent('https://second', new Date(2026, 10, 27, 9)),
      ],
    });

    await sendServerGreeting();

    expect(send.mock.calls[0][0]).toContain('https://first\nhttps://second');
  });
});
