import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { POKEMON_IMAGE_URLS } from '@/constants/pokemon';
import { LogCode } from '@/enums/logs';
import { InventoryDocument } from '@/interfaces/inventory';
import { UserDocument } from '@/interfaces/user';

import { getTotalBalls, getUpgradePrice } from '@/lib/utils';
import { getInventory, updateCapacity } from '@/services/inventory';
import { setDiscordUser } from '@/services/user';

import { log, reply } from '../helpers';

const renderInventory = async (
  user: UserDocument,
  inventory: InventoryDocument,
  avatarUrl: string,
) => {
  const nextUpgrade = getUpgradePrice(inventory.capacity);

  let row = null;

  if (nextUpgrade > 0) {
    row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${user.discord_id}:inventory:upgrade:${nextUpgrade}`)
        .setLabel(`Upgrade (+1 Slot) - Cost: ${nextUpgrade}`)
        .setStyle(ButtonStyle.Success),
    );
  }

  const inventoryIcon = `${POKEMON_IMAGE_URLS.base}/inventory/backpack.png`;

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

  const botEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
    .setAuthor({
      name: 'Inventory',
      iconURL: avatarUrl,
    })
    .setDescription(
      `Here are the items in your inventory:\n\n${ballLines}\n\n${capacityLine}`,
    )
    .setThumbnail(inventoryIcon)
    .setFooter({
      text: `CASH BALANCE: ${user.cash}`,
      iconURL: POKEMON_IMAGE_URLS.base + '/currency/silver.png',
    });

  return { botEmbed, row };
};

export const Inventory = {
  data: new SlashCommandBuilder()
    .setName(COPY.INVENTORY.NAME)
    .setDescription(COPY.INVENTORY.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
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

    const { botEmbed, row } = await renderInventory(
      user,
      inventory,
      interaction.user.displayAvatarURL(),
    );

    try {
      await interaction.reply({
        embeds: [botEmbed],
        components: row ? [row] : [],
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
  onUpgradeClick: async (
    interaction: ButtonInteraction,
    user: UserDocument,
    payload: string,
  ) => {
    const upgradeCost = parseInt(payload, 10);

    if (user.cash < upgradeCost) {
      await interaction.reply({
        content: `You don't have enough points to upgrade your inventory.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const updatedUser = await setDiscordUser(interaction.user.id, {
      cash: user.cash - upgradeCost,
    });

    const inventory = await updateCapacity(interaction.user.id);

    if (!inventory) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { botEmbed } = await renderInventory(
      updatedUser ?? user,
      inventory,
      interaction.user.displayAvatarURL(),
    );

    try {
      await interaction.editReply({
        embeds: [botEmbed],
        components: [],
      });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
};
