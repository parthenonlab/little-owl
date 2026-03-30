import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { POKEMON_IMAGE_URLS } from '@/constants/pokemon';
import { LogCode } from '@/enums/logs';
import { getInventory } from '@/services/inventory';

import { log, reply } from '../helpers';
import { getTotalBalls, getUpgradePrice } from '@/lib/utils';

export const Inventory = {
  data: new SlashCommandBuilder()
    .setName(COPY.INVENTORY.NAME)
    .setDescription(COPY.INVENTORY.DESCRIPTION),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!CONFIG.FEATURES.INVENTORY.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const inventory = await getInventory(interaction.user.id);

    if (!inventory) {
      reply({
        content: COPY.ERROR.GENERIC,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const nextUpgrade = getUpgradePrice(inventory.capacity);

    let row = null;

    if (nextUpgrade > 0) {
      row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('inventory_upgrade')
          .setLabel(`Upgrade (+1 Slot) - Cost: ${nextUpgrade}`)
          .setStyle(ButtonStyle.Success),
      );
    }

    const inventoryIcon = `${POKEMON_IMAGE_URLS.base}/inventory/bag.png`;

    const balls = inventory.balls;
    const ballLines = [
      {
        emoji: EMOJIS.POKEMON.POKEBALL,
        label: 'Poké Balls',
        count: balls.pokeball,
      },
      {
        emoji: EMOJIS.POKEMON.GREATBALL,
        label: 'Great Balls',
        count: balls.greatball,
      },
      {
        emoji: EMOJIS.POKEMON.ULTRABALL,
        label: 'Ultra Balls',
        count: balls.ultraball,
      },
      {
        emoji: EMOJIS.POKEMON.MASTERBALL,
        label: 'Master Balls',
        count: balls.masterball,
      },
    ]
      .filter(ball => ball.count > 0)
      .map(ball => `${ball.emoji} ${ball.label}: \`${ball.count}\``)
      .join('\n\n');

    const capacityLine = `Total Capacity: \`${inventory.capacity}\` • Available Slots: \`${inventory.capacity - getTotalBalls(inventory.balls)}\``;

    try {
      const botEmbed = new EmbedBuilder()
        .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
        .setAuthor({
          name: 'Inventory',
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `Here are the items in your inventory:\n\n${ballLines}\n\n${capacityLine}`,
        )
        .setThumbnail(inventoryIcon);

      await interaction.reply({
        embeds: [botEmbed],
        ...(row && { components: [row] }),
      });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
  getName: (): string => {
    return COPY.INVENTORY.NAME;
  },
};
