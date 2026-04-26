import { ChatInputCommandInteraction } from 'discord.js';

import { COPY } from '@/constants';
import { isFeatureEnabled } from '@/lib/config';

import { reply } from './reply';

export const checkFeatureEnabled = async (
  feature: string,
  interaction: ChatInputCommandInteraction,
): Promise<boolean> => {
  if (!isFeatureEnabled(feature)) {
    await reply({ content: COPY.DISABLED, ephemeral: true, interaction });
    return false;
  }

  return true;
};
