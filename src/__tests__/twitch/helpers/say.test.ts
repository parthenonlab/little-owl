jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn() } }));
jest.mock('@/lib/clients', () => ({
  helix: { chat: { sendChatMessageAsApp: jest.fn() } },
}));

import { helix } from '@/lib/clients';
import { logger } from '@/lib/logger';
import { say } from '@/twitch/helpers/say';

const send = helix.chat.sendChatMessageAsApp as jest.Mock;
const IDS = { botId: '143', broadcasterId: '999' };

describe('say', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends the message as the bot to the broadcaster', async () => {
    send.mockResolvedValue({ isSent: true });

    await say(IDS, 'hello');

    expect(send).toHaveBeenCalledWith('143', '999', 'hello');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs when Twitch drops the message', async () => {
    send.mockResolvedValue({
      isSent: false,
      dropReasonMessage: 'msg_duplicate',
    });

    await say(IDS, 'hello');

    expect((logger.error as jest.Mock).mock.calls[0][0].dropReason).toBe(
      'msg_duplicate',
    );
  });

  it('logs instead of throwing when the request fails', async () => {
    send.mockRejectedValue(new Error('boom'));

    await expect(say(IDS, 'hello')).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});
