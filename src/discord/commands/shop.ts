import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import {
  BALL_LABELS,
  BallType,
  POKEMON_IMAGE_URLS,
  SHOP_PRICES,
} from '@/constants/pokemon';
import { LogCode } from '@/enums/logs';

import { BotState } from '@/interfaces/bot';
import { UserDocument } from '@/interfaces/user';
import { getInventory } from '@/services/inventory';

import { getShopActions, getTotalBalls, log, reply } from '../helpers';

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

  const shopLines = [
    {
      emoji: EMOJIS.POKEMON.POKEBALL,
      label: BALL_LABELS.pokeball.toUpperCase(),
      stock: state.shop.pokeball,
      price: SHOP_PRICES.pokeball,
    },
    {
      emoji: EMOJIS.POKEMON.GREATBALL,
      label: BALL_LABELS.greatball.toUpperCase(),
      stock: state.shop.greatball,
      price: SHOP_PRICES.greatball,
    },
    {
      emoji: EMOJIS.POKEMON.ULTRABALL,
      label: BALL_LABELS.ultraball.toUpperCase(),
      stock: state.shop.ultraball,
      price: SHOP_PRICES.ultraball,
    },
    {
      emoji: EMOJIS.POKEMON.MASTERBALL,
      label: BALL_LABELS.masterball.toUpperCase(),
      stock: state.shop.masterball,
      price: '1,000,000',
    },
  ]
    .map(ball => {
      const header = `${ball.emoji} ${ball.label}`;
      const description = `Stock: \`${ball.stock}\` - Price: \`${ball.price}\``;

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
    .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
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
      text: `CASH BALANCE: ${user.cash} | INVENTORY SPACE: ${availableSpace}`,
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
    if (!CONFIG.FEATURES.SHOP.ENABLED) {
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

    const availableSpace = inventory.capacity - getTotalBalls(inventory.balls);

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
    ball: BallType,
  ) => {
    const modal = new ModalBuilder({
      custom_id: `${interaction.user.id}:shop:modal:${ball}:`,
      title: `Buy ${BALL_LABELS[ball]}`,
      components: [
        new ActionRowBuilder<TextInputBuilder>({
          components: [
            new TextInputBuilder({
              custom_id: 'amount',
              label: 'How many would you like to buy?',
              style: TextInputStyle.Short,
              placeholder: `Enter amount (Max: ${state.shop[ball]})`,
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
};
