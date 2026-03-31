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

import { CONFIG, COPY } from '@/constants';
import { POKEBALLS, POKEMON_IMAGE_URLS } from '@/constants/pokemon';
import { LogCode } from '@/enums/logs';

import { InventoryDocument } from '@/interfaces/inventory';
import { PokeballObject } from '@/interfaces/pokemon';
import { UserDocument } from '@/interfaces/user';

import { formatPrice } from '@/lib/utils';
import { getInventory, updateCapacity } from '@/services/inventory';
import { setDiscordUser } from '@/services/user';

import { getTotalBalls, getUpgradePrice, log, reply } from '../helpers';

const renderInventory = async (
  user: UserDocument,
  inventory: InventoryDocument,
  avatarUrl: string,
) => {
  const inventoryIcon = `${POKEMON_IMAGE_URLS.base}/inventory/backpack.png`;

  const balls = inventory.balls;
  const ballLines = POKEBALLS.map((ball: PokeballObject) => {
    return {
      ...ball,
      count: balls[ball.type],
    };
  })
    .filter(ball => ball.count > 0)
    .map(ball => `${ball.emoji} ${ball.label}: \`${ball.count}\``)
    .join('\n\n');

  const capacityLine = `Total Capacity: \`${inventory.capacity}\` • Available Slots: \`${inventory.capacity - getTotalBalls(inventory.balls)}\``;

  const botEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.POKEMON.RED as ColorResolvable)
    .setAuthor({
      name: 'Inventory',
      iconURL: avatarUrl,
    })
    .setDescription(
      `Here are the items in your inventory:\n\n${ballLines}\n\n${capacityLine}`,
    )
    .setThumbnail(inventoryIcon)
    .setFooter({
      text: `CASH BALANCE: ${formatPrice(user.cash)}`,
      iconURL: POKEMON_IMAGE_URLS.base + '/currency/silver.png',
    });

  return botEmbed;
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

    const nextUpgrade = getUpgradePrice(inventory.capacity);

    let row = null;

    if (nextUpgrade > 0) {
      row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${user.discord_id}:inventory`)
          .setLabel(`Upgrade (+1 Slot) - Cost: ${formatPrice(nextUpgrade)}`)
          .setStyle(ButtonStyle.Success),
      );
    }

    const embed = await renderInventory(
      user,
      inventory,
      interaction.user.displayAvatarURL(),
    );

    try {
      await interaction.reply({
        embeds: [embed],
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
  ) => {
    const inventory = await getInventory(interaction.user.id);

    if (!inventory) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const totalPrice = getUpgradePrice(inventory.capacity);

    if (user.cash < totalPrice) {
      await interaction.reply({
        content: `You don't have enough points to upgrade your inventory.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const updatedUser = await setDiscordUser(interaction.user.id, {
      cash: user.cash - totalPrice,
    });

    const updatedInventory = await updateCapacity(interaction.user.id);

    if (!updatedUser || !updatedInventory) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const embed = await renderInventory(
        updatedUser,
        updatedInventory,
        interaction.user.displayAvatarURL(),
      );

      await interaction.deferUpdate();

      await interaction.editReply({
        embeds: [embed],
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
