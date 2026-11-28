jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));
jest.mock('@/lib/clients', () => ({
  helix: { chat: { sendChatMessageAsApp: jest.fn() } },
}));

import { log } from '@/discord/helpers';
import { helix } from '@/lib/clients';
import { say } from '@/twitch/helpers/say';

const send = helix.chat.sendChatMessageAsApp as jest.Mock;
const IDS = { botId: '143', broadcasterId: '999' };

describe('say', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends the message as the bot to the broadcaster', async () => {
    send.mockResolvedValue({ isSent: true });

    await say(IDS, 'hello');

    expect(send).toHaveBeenCalledWith('143', '999', 'hello');
    expect(log).not.toHaveBeenCalled();
  });

  it('logs when Twitch drops the message', async () => {
    send.mockResolvedValue({
      isSent: false,
      dropReasonMessage: 'msg_duplicate',
    });

    await say(IDS, 'hello');

    expect((log as jest.Mock).mock.calls[0][0].description).toContain(
      'msg_duplicate',
    );
  });

  it('logs instead of throwing when the request fails', async () => {
    send.mockRejectedValue(new Error('boom'));

    await expect(say(IDS, 'hello')).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
  });
});
