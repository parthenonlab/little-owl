import { Events } from 'discord.js';

import { discord } from '@/lib/clients';
import { LogEntry, setErrorSink } from '@/lib/logger';

import { logToErrorsChannel } from './log';

const DEDUPE_MS = 5 * 60 * 1000;
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 5;

// Only these fields reach Discord; everything else (filters, payloads) stays on stdout.
const CONTEXT_KEYS = [
  'event',
  'command',
  'customId',
  'task',
  'discordId',
  'twitchId',
  'guildId',
  'broadcasterId',
];

const lastSent = new Map<string, number>();
const pending = new Set<Promise<void>>();

let windowStart = 0;
let sentInWindow = 0;
let suppressed = 0;

/** Whether an entry passes the dedupe window and rate limit. Counts it as suppressed if not. */
const shouldSend = (key: string, now: number) => {
  for (const [k, time] of lastSent) {
    if (now - time >= DEDUPE_MS) lastSent.delete(k);
  }

  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    sentInWindow = 0;
  }

  if (lastSent.has(key) || sentInWindow >= MAX_PER_WINDOW) {
    suppressed += 1;
    return false;
  }

  lastSent.set(key, now);
  sentInWindow += 1;
  return true;
};

const getFooter = (entry: LogEntry) => {
  const parts = CONTEXT_KEYS.filter(key => entry[key] !== undefined).map(
    key => `${key}: ${String(entry[key])}`,
  );

  if (entry.level >= 60) parts.unshift('FATAL');

  if (suppressed > 0) {
    parts.push(
      `${suppressed} similar or rate-limited error(s) skipped — see stdout`,
    );
    suppressed = 0;
  }

  return parts.join(' · ') || undefined;
};

const send = (entry: LogEntry) => {
  const title = entry.msg.replace(/^🦉 /, '').slice(0, 256);
  const description = (entry.err?.stack ?? entry.err?.message ?? title).slice(
    0,
    4000,
  );

  const sending = logToErrorsChannel({
    title,
    description,
    footer: getFooter(entry),
  });

  pending.add(sending);
  sending.finally(() => pending.delete(sending));
};

/**
 * Forward `error` and `fatal` logger entries to the Discord error channel.
 * Repeats of the same error within 5 minutes are dropped, and at most 5 are sent per minute.
 * Entries logged before the client is ready are sent once it is.
 */
export const forwardErrorsToDiscord = () => {
  setErrorSink(entry => {
    const key = `${entry.msg}|${entry.err?.message ?? ''}`;

    if (!shouldSend(key, Date.now())) return;

    if (discord.isReady()) return send(entry);

    discord.once(Events.ClientReady, () => send(entry));
  });
};

/**
 * Wait for in-flight Discord error logs, up to a timeout. Use before exiting the process.
 *
 * @param timeoutMs - Maximum time to wait.
 */
export const flushDiscordErrors = async (timeoutMs = 5000) => {
  const timeout = new Promise<void>(resolve =>
    setTimeout(resolve, timeoutMs).unref(),
  );
  await Promise.race([Promise.all(pending), timeout]);
};
