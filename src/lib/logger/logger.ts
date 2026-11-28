import {
  DestinationStream,
  LoggerOptions,
  multistream,
  pino,
  transport,
} from 'pino';

const isStaging = Boolean(process.env.STAGING);
const isTest = process.env.NODE_ENV === 'test';

/** A serialized log entry, as passed to the error sink. */
export interface LogEntry {
  level: number;
  msg: string;
  err?: { type?: string; message?: string; stack?: string };
  [key: string]: unknown;
}

export type ErrorSink = (entry: LogEntry) => void;

let errorSink: ErrorSink | null = null;

/**
 * Register a handler for every `error` and `fatal` entry (e.g. forwarding to Discord).
 * Pass null to stop forwarding.
 */
export const setErrorSink = (sink: ErrorSink | null) => {
  errorSink = sink;
};

const errorStream: DestinationStream = {
  write: (line: string) => {
    if (!errorSink) return;

    try {
      errorSink(JSON.parse(line));
    } catch {
      // A failing sink must never break logging; the entry is still on stdout.
    }
  },
};

const getLevel = () => {
  if (isTest) return 'silent';
  if (isStaging) return 'debug';
  return 'info';
};

// Readable output in staging; JSON lines to stdout in production.
const getStdout = (): DestinationStream => {
  if (!isStaging || isTest) return pino.destination({ dest: 1, sync: true });

  return transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    },
  });
};

const options: LoggerOptions = {
  name: 'little-owl',
  level: getLevel(),
  msgPrefix: '🦉 ',
};

/**
 * App-wide logger. Writes to stdout and works before Discord connects.
 * Pass errors as `{ err }` so pino serializes the stack.
 * `error` and `fatal` entries are also passed to the error sink, if one is set.
 */
export const logger = pino(
  options,
  multistream([
    { level: 'trace', stream: getStdout() },
    { level: 'error', stream: errorStream },
  ]),
);
