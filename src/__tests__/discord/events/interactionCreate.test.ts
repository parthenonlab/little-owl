jest.mock('@/discord/helpers', () => ({
  handleButtonInteraction: jest.fn(),
  handleCommandInteraction: jest.fn(),
  handleModalInteraction: jest.fn(),
}));
jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn() } }));

import { Interaction } from 'discord.js';

import { onInteractionCreate } from '@/discord/events/interactionCreate';

import {
  handleButtonInteraction,
  handleCommandInteraction,
} from '@/discord/helpers';

import { logger } from '@/lib/logger';

import { fake, makeBotState } from '../../fixtures';

const command = () =>
  fake<Interaction>({
    commandName: 'shop',
    user: { id: '42' } as Interaction['user'],
    isChatInputCommand: (() => true) as Interaction['isChatInputCommand'],
    isCommand: (() => true) as Interaction['isCommand'],
    isButton: (() => false) as Interaction['isButton'],
    isMessageComponent: (() => false) as Interaction['isMessageComponent'],
    isModalSubmit: (() => false) as Interaction['isModalSubmit'],
  } as Partial<Interaction>);

const button = () =>
  fake<Interaction>({
    customId: '42:shop:pokeball',
    user: { id: '42' } as Interaction['user'],
    isChatInputCommand: (() => false) as Interaction['isChatInputCommand'],
    isCommand: (() => false) as Interaction['isCommand'],
    isButton: (() => true) as Interaction['isButton'],
    isMessageComponent: (() => true) as Interaction['isMessageComponent'],
    isModalSubmit: (() => false) as Interaction['isModalSubmit'],
  } as Partial<Interaction>);

describe('onInteractionCreate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes slash commands', async () => {
    const interaction = command();

    await onInteractionCreate(makeBotState(), interaction);

    expect(handleCommandInteraction).toHaveBeenCalledWith(
      expect.anything(),
      interaction,
    );
  });

  it('logs command failures with the command name and user', async () => {
    const error = new Error('boom');
    (handleCommandInteraction as jest.Mock).mockRejectedValue(error);

    await expect(
      onInteractionCreate(makeBotState(), command()),
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(
      { err: error, command: 'shop', customId: undefined, discordId: '42' },
      'Interaction failed',
    );
  });

  it('logs button failures with the custom ID', async () => {
    const error = new Error('boom');
    (handleButtonInteraction as jest.Mock).mockRejectedValue(error);

    await onInteractionCreate(makeBotState(), button());

    expect(logger.error).toHaveBeenCalledWith(
      {
        err: error,
        command: undefined,
        customId: '42:shop:pokeball',
        discordId: '42',
      },
      'Interaction failed',
    );
  });
});
