jest.mock('@/discord/helpers', () => ({ log: jest.fn() }));

import { Collection, GuildTextBasedChannel, Message } from 'discord.js';

import { onMessageDeleteBulk } from '@/discord/events/messageDeleteBulk';
import { log } from '@/discord/helpers';

import { fake } from '../../fixtures';

const CHANNEL = '#general' as unknown as GuildTextBasedChannel;

const message = (id: string, createdTimestamp: number, content: string) =>
  fake<Message<true>>({
    id,
    createdTimestamp,
    cleanContent: content,
    author: { username: `user${id}` } as Message<true>['author'],
  });

const collection = (messages: Message<true>[]) =>
  new Collection(messages.map(m => [m.id, m]));

const props = () => (log as jest.Mock).mock.calls[0][0];

describe('onMessageDeleteBulk', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logs one embed listing the messages oldest first', async () => {
    await onMessageDeleteBulk(
      collection([message('2', 200, 'second'), message('1', 100, 'first')]),
      CHANNEL,
    );

    expect(log).toHaveBeenCalledTimes(1);
    expect(props().type).toBe('messages');
    expect(props().title).toBe('2 Messages Bulk Deleted');
    expect(props().description).toBe(
      'Deleted In: #general\n\n**user1:** first\n**user2:** second',
    );
  });

  it('stays within the embed limit and counts what was left out', async () => {
    const many = Array.from({ length: 50 }, (_, i) =>
      message(String(i), i, 'x'.repeat(150)),
    );

    await onMessageDeleteBulk(collection(many), CHANNEL);

    expect(props().description.length).toBeLessThan(4096);
    expect(props().description).toMatch(/…and \d+ more$/);
  });

  it('does nothing for an empty collection', async () => {
    await onMessageDeleteBulk(new Collection(), CHANNEL);

    expect(log).not.toHaveBeenCalled();
  });
});
