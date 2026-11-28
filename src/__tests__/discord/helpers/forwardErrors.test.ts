jest.mock('@/discord/helpers/log', () => ({
  logToErrorsChannel: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/clients', () => ({
  discord: { isReady: jest.fn(() => true), once: jest.fn() },
}));
jest.mock('@/lib/logger', () => ({ setErrorSink: jest.fn() }));

import { LogEntry } from '@/lib/logger';

const NOW = new Date('2026-11-28T12:00:00Z').getTime();

const entry = (msg: string, extra: Partial<LogEntry> = {}): LogEntry => ({
  level: 50,
  msg: `🦉 ${msg}`,
  ...extra,
});

/** Load a fresh copy of the module (its dedupe/rate state is module-level) and return the sink. */
const setup = () => {
  let sink: (entry: LogEntry) => void = () => {};
  let log: jest.Mock = jest.fn();
  let discord: { isReady: jest.Mock; once: jest.Mock } = {
    isReady: jest.fn(),
    once: jest.fn(),
  };

  jest.isolateModules(() => {
    const logger = require('@/lib/logger');
    const {
      forwardErrorsToDiscord,
    } = require('@/discord/helpers/forwardErrors');

    log = require('@/discord/helpers/log').logToErrorsChannel;
    discord = require('@/lib/clients').discord;

    forwardErrorsToDiscord();
    sink = (logger.setErrorSink as jest.Mock).mock.calls[0][0];
  });

  return { sink, log, discord };
};

describe('forwardErrorsToDiscord', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => jest.useRealTimers());

  it('sends the message as title and the stack as description', () => {
    const { sink, log } = setup();

    sink(
      entry('Failed to get user', {
        err: { message: 'boom', stack: 'Error: boom\n  at x' },
      }),
    );

    expect(log).toHaveBeenCalledWith({
      title: 'Failed to get user',
      description: 'Error: boom\n  at x',
      footer: undefined,
    });
  });

  it('only includes allowed context fields in the footer', () => {
    const { sink, log } = setup();

    sink(
      entry('Failed', {
        discordId: '123',
        command: 'shop',
        filter: { secret: 1 },
      }),
    );

    expect(log.mock.calls[0][0].footer).toBe('command: shop · discordId: 123');
  });

  it('marks fatal entries', () => {
    const { sink, log } = setup();

    sink(entry('Uncaught exception', { level: 60 }));

    expect(log.mock.calls[0][0].footer).toBe('FATAL');
  });

  it('drops repeats within 5 minutes and reports them on the next send', () => {
    const { sink, log } = setup();

    sink(entry('Same'));
    sink(entry('Same'));
    expect(log).toHaveBeenCalledTimes(1);

    jest.setSystemTime(NOW + 5 * 60 * 1000);
    sink(entry('Same'));

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[1][0].footer).toContain('1 similar or rate-limited');
  });

  it('sends at most 5 per minute', () => {
    const { sink, log } = setup();

    for (let i = 0; i < 8; i++) sink(entry(`Error ${i}`));
    expect(log).toHaveBeenCalledTimes(5);

    jest.setSystemTime(NOW + 60 * 1000);
    sink(entry('Later'));

    expect(log).toHaveBeenCalledTimes(6);
    expect(log.mock.calls[5][0].footer).toContain('3 similar or rate-limited');
  });

  it('waits for the client to be ready', () => {
    const { sink, log, discord } = setup();
    discord.isReady.mockReturnValue(false);

    sink(entry('Early'));
    expect(log).not.toHaveBeenCalled();

    const onReady = discord.once.mock.calls[0][1];
    onReady();

    expect(log).toHaveBeenCalledTimes(1);
  });
});
