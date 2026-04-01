import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { UserDocument } from '@parthenonlab/models';

import { CONFIG, COPY } from '@/constants';
import { POKEBALLS, POKEMON_IMAGE_URLS } from '@/constants/pokemon';
import { LogCode } from '@/enums/logs';

import { BotState } from '@/interfaces/bot';
import { PokeballObject } from '@/interfaces/pokemon';

import { formatPriceToCode, formatPriceToString } from '@/lib/utils';
import { getInventory, updateBalls } from '@/services/inventory';
import { setDiscordUser } from '@/services/user';

import {
  checkFeatureEnabled,
  getInventorySpace,
  getShopActions,
  log,
  reply,
} from '../helpers';

const getNextDailyRestock = (lastRestock: Date): number => {
  const next = new Date(lastRestock);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return Math.floor(next.getTime() / 1000);
};

const getNextWeeklyRestock = (lastRestock: Date): number => {
  const next = new Date(lastRestock);
  const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
  next.setDate(next.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return Math.floor(next.getTime() / 1000);
};

const renderShop = async (
  state: BotState,
  user: UserDocument,
  availableSpace: number,
  avatarUrl: string,
) => {
  const shopIcon = `${POKEMON_IMAGE_URLS.base}/inventory/pokemart.png`;

  const shopLines = POKEBALLS.map((ball: PokeballObject) => {
    return {
      ...ball,
      label: ball.label.toUpperCase(),
      stock: state.shop[ball.type],
    };
  })
    .map(ball => {
      const header = `${ball.emoji} ${ball.label}`;
      const description = `Stock: \`${ball.stock}\` - Price: ${formatPriceToCode(ball.price)}`;

      return `${header}\n\u2003\u2002${description}`;
    })
    .join('\n\n');

  const nextDailyRestock = getNextDailyRestock(state.shop.lastDailyRestock);
  const nextWeeklyRestock = getNextWeeklyRestock(state.shop.lastWeeklyRestock);

  const restockLine = `Daily Restock: <t:${nextDailyRestock}:R> (Master Ball: <t:${nextWeeklyRestock}:R>)`;

  let row = null;

  if (availableSpace > 0) {
    row = await getShopActions(state.shop, user.discord_id!);
  }

  const botEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.POKEMON.RED as ColorResolvable)
    .setAuthor({
      name: 'Shopping...',
      iconURL: avatarUrl,
    })
    .setTitle('Welcome to the Poké Mart!')
    .setDescription(
      `Here are the items available for purchase:\n\n${shopLines}\n\n${restockLine}`,
    )
    .setThumbnail(shopIcon)
    .setFooter({
      text: `CASH BALANCE: ${formatPriceToString(user.cash)}  |  INVENTORY SPACE: ${availableSpace}`,
      iconURL: POKEMON_IMAGE_URLS.base + '/currency/silver.png',
    });

  return { botEmbed, row };
};

export const Shop = {
  data: new SlashCommandBuilder()
    .setName(COPY.SHOP.NAME)
    .setDescription(COPY.SHOP.DESCRIPTION),
  execute: async (
    state: BotState,
    interaction: ChatInputCommandInteraction,
    user: UserDocument,
  ) => {
    if (!(await checkFeatureEnabled('SHOP', interaction))) return;

    if (state.exploreList.has(interaction.user.id)) {
      reply({
        content: 'There is currently a Pokémon in front of you!',
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

    const availableSpace = getInventorySpace(inventory);

    const { botEmbed, row } = await renderShop(
      state,
      user,
      availableSpace,
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
    return COPY.SHOP.NAME;
  },
  onBuyClick: async (
    state: BotState,
    interaction: ButtonInteraction,
    pokeball: PokeballObject,
  ) => {
    const modal = new ModalBuilder({
      custom_id: `${interaction.user.id}:shop:${pokeball.type}:`,
      title: `Buy ${pokeball.label}`,
      components: [
        new ActionRowBuilder<TextInputBuilder>({
          components: [
            new TextInputBuilder({
              custom_id: 'amount',
              label: 'How many would you like to buy?',
              style: TextInputStyle.Short,
              placeholder: `Enter amount (max: ${state.shop[pokeball.type]})`,
              min_length: 1,
              max_length: 7,
              required: true,
            }),
          ],
        }),
      ],
    });

    await interaction.showModal(modal);
  },
  onModalSubmit: async (
    state: BotState,
    interaction: ModalSubmitInteraction,
    user: UserDocument,
    pokeball: PokeballObject,
  ) => {
    const raw = interaction.fields.getTextInputValue('amount');
    const amount = parseInt(raw);

    if (isNaN(amount) || amount <= 0) {
      await interaction.reply({
        content: 'Please enter a valid amount.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (amount > state.shop[pokeball.type]) {
      await interaction.reply({
        content: `Sorry, we only have ${state.shop[pokeball.type]} ${pokeball.label} in stock.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const totalPrice = amount * pokeball.price;

    if (totalPrice > user.cash) {
      await interaction.reply({
        content: `You don't have enough ${CONFIG.CURRENCY.PLURAL} to buy ${amount} ${pokeball.label}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const inventory = await getInventory(interaction.user.id);

    if (!inventory) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (amount > getInventorySpace(inventory!)) {
      await interaction.reply({
        content: `You don't have enough inventory space to buy ${amount} ${pokeball.label}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    state.shop[pokeball.type] -= amount;

    const updatedUser = await setDiscordUser(interaction.user.id, {
      cash: user.cash - totalPrice,
    });

    const updatedInventory = await updateBalls(interaction.user.id, {
      [pokeball.type]: inventory.balls[pokeball.type] + amount,
    });

    if (!updatedUser || !updatedInventory) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const availableSpace = getInventorySpace(updatedInventory);

    try {
      const { botEmbed, row } = await renderShop(
        state,
        updatedUser,
        availableSpace,
        interaction.user.displayAvatarURL(),
      );

      if (!interaction.message) {
        await interaction.reply({
          embeds: [botEmbed],
          components: row ? [row] : [],
        });
        return;
      }

      await interaction.deferUpdate();

      await interaction.message.edit({
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
};
