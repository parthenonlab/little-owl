import { logger } from './logger';

/**
 * Wrap a handler so anything it throws or rejects with is logged instead of escaping.
 * Use for event listeners and scheduled tasks, where nothing else would catch it.
 *
 * @param message - Log message on failure, e.g. 'Discord event handler failed'.
 * @param context - Fields that identify the handler, e.g. `{ event: 'messageCreate' }`.
 * @param fn - The handler to wrap.
 * @returns A handler with the same arguments that never rejects.
 */
export const withErrorLogging =
  <A extends unknown[]>(
    message: string,
    context: Record<string, unknown>,
    fn: (...args: A) => unknown,
  ) =>
  async (...args: A): Promise<void> => {
    try {
      await fn(...args);
    } catch (error) {
      logger.error({ err: error, ...context }, message);
    }
  };
