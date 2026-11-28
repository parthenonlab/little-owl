jest.mock('@/lib/logger/logger', () => ({ logger: { error: jest.fn() } }));

import { logger } from '@/lib/logger/logger';
import { withErrorLogging } from '@/lib/logger/withErrorLogging';

describe('withErrorLogging', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes arguments through to the handler', async () => {
    const handler = jest.fn();

    await withErrorLogging('Failed', {}, handler)('a', 1);

    expect(handler).toHaveBeenCalledWith('a', 1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs rejections with the context instead of rejecting', async () => {
    const error = new Error('boom');
    const wrapped = withErrorLogging('Handler failed', { event: 'x' }, () =>
      Promise.reject(error),
    );

    await expect(wrapped()).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      { err: error, event: 'x' },
      'Handler failed',
    );
  });

  it('logs synchronous throws', async () => {
    const wrapped = withErrorLogging('Handler failed', {}, () => {
      throw new Error('sync');
    });

    await expect(wrapped()).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});
