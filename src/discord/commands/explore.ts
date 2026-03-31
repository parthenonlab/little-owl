import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY } from '@/constants';

import {
  FLEE_PROMPTS,
  POKEMON_IMAGE_URLS,
  POKEMON_LIST,
  POKEMON_RARITY_WEIGHTS,
  POKEMON_SHINY_WEIGHTS,
  POKEMON_TYPE_EMOJIS,
  RUN_PROMPTS,
} from '@/constants/pokemon';

import { LogCode } from '@/enums/logs';
import { BotState } from '@/interfaces/bot';

import {
  PokeballObject,
  PokemonExplorePayload,
  PokemonRarity,
} from '@/interfaces/pokemon';

import { capitalize, weightedRandom } from '@/lib/utils';
import { saveCatch } from '@/services/catch';
import { getInventory, updateBalls } from '@/services/inventory';

import { getActiveSpawn, getExploreActions, log, reply } from '../helpers';

/**
 * Creates a base embed for explore interactions.
 *
 * @param title - The embed title
 * @param authorIcon - URL of the user's avatar
 * @param pokemonIcon - URL of the Pokemon icon
 * @returns A base {@link EmbedBuilder} for further customization
 */
const renderEmbedHeader = (
  title: string,
  authorIcon: string,
  pokemonIcon: string,
) => {
  return new EmbedBuilder()
    .setColor(CONFIG.COLORS.POKEMON.RED as ColorResolvable)
    .setAuthor({
      name: 'Exploring...',
      iconURL: authorIcon,
    })
    .setTitle(title)
    .setThumbnail(pokemonIcon);
};

/**
 * `/explore` command — spawns a random wild Pokemon encounter for the user.
 */
export const Explore = {
  data: new SlashCommandBuilder()
    .setName(COPY.EXPLORE.NAME)
    .setDescription(COPY.EXPLORE.DESCRIPTION),
  /**
   * Spawns a wild Pokemon for the user and posts an embed with catch/run buttons.
   *
   * @param state - Global bot state
   * @param interaction - The incoming slash command interaction
   */
  execute: async (
    state: BotState,
    interaction: ChatInputCommandInteraction,
  ) => {
    if (!CONFIG.FEATURES.EXPLORE.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    if (state.exploreList.has(interaction.user.id)) {
      reply({
        content: 'There is currently a Pokémon in front of you!',
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const activeSpawn = getActiveSpawn();
    const rarity = weightedRandom(POKEMON_RARITY_WEIGHTS) as PokemonRarity;

    const pokemonPool = POKEMON_LIST.filter(pokemon => {
      return (
        pokemon.rarity === rarity &&
        (pokemon.activeSpawn === 'both' || pokemon.activeSpawn === activeSpawn)
      );
    });

    const selectedPokemon =
      pokemonPool[Math.floor(Math.random() * pokemonPool.length)];

    const gender = selectedPokemon.genderRatio
      ? weightedRandom(selectedPokemon.genderRatio)
      : null;

    const variant = weightedRandom(POKEMON_SHINY_WEIGHTS);
    const isShiny = variant === 'shiny';

    let imageName = variant;
    let iconName = selectedPokemon.slug;

    if (gender === 'female' && selectedPokemon.hasFemaleImage) {
      imageName = isShiny ? `${gender}-shiny` : gender;
      iconName = `${selectedPokemon.slug}-f`;
    }

    const pokemonImage = `${POKEMON_IMAGE_URLS.base}/pokemon/${selectedPokemon.id}/${imageName}.gif`;
    const pokemonIcon = `${POKEMON_IMAGE_URLS.pokemondb}/${variant}/${iconName}.png`;

    const rarityLabel = capitalize(rarity);
    const genderLabel = gender ? capitalize(gender) : 'N/A';
    const variantLabel = capitalize(variant);

    const payload: PokemonExplorePayload = {
      id: selectedPokemon.id,
      name: selectedPokemon.name,
      rarity,
      catchRate: selectedPokemon.catchRate,
      attempts: 3,
      types: selectedPokemon.types,
      gender,
      variant,
      shiny: isShiny,
      pokemonImage,
      pokemonIcon,
      authorIcon: interaction.user.displayAvatarURL(),
    };

    state.exploreList.set(interaction.user.id, payload);

    try {
      const title = `A wild ${isShiny ? 'Shiny ' : ''}${selectedPokemon.name} appeared!`;

      const embed = renderEmbedHeader(
        title,
        payload.authorIcon,
        payload.pokemonIcon,
      );

      embed
        .setDescription('Catch it or run away with the buttons below!')
        .setImage(pokemonImage)
        .setFooter({
          text: `Rarity: ${rarityLabel}  |  Gender: ${genderLabel}  |  Variant: ${variantLabel}`,
        });

      const row = await getExploreActions(interaction.user.id);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
  /**
   * @returns The slash command name
   */
  getName: (): string => {
    return COPY.EXPLORE.NAME;
  },
  /**
   * Handles a Use button click. Rolls against the Pokemon's catch rate and
   * either confirms the catch or decrements the attempt counter.
   *
   * @param state - Global bot state
   * @param interaction - The button interaction
   * @param pokeball - The pokeball the user selected
   */
  onUseClick: async (
    state: BotState,
    interaction: ButtonInteraction,
    pokeball: PokeballObject,
  ) => {
    const payload = state.exploreList.get(interaction.user.id);

    if (!payload) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const inventory = await getInventory(interaction.user.id);

    if (!inventory || inventory.balls[pokeball.type] < 1) {
      await interaction.reply({
        content: `You don't have any ${pokeball.label} left.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await updateBalls(interaction.user.id, {
      [pokeball.type]: inventory.balls[pokeball.type] - 1,
    });

    const caught =
      pokeball.multiplier === Infinity ||
      Math.random() < (payload.catchRate / 255) * pokeball.multiplier;

    const rarityLabel = capitalize(payload.rarity);
    const variantLabel = capitalize(payload.variant);

    const genderLabel = payload.gender ? capitalize(payload.gender) : 'N/A';

    const pokemonTypes = payload.types
      .map(type => POKEMON_TYPE_EMOJIS[type])
      .join(' ');

    if (caught) {
      state.exploreList.delete(interaction.user.id);

      const title = `You caught ${payload.shiny ? 'Shiny ' : ''}${payload.name}!`;
      const description = `Pokédex ID: \`${payload.id}\` | Ball Used: ${pokeball.emoji}`;
      const details = `Rarity - \`${rarityLabel}\`\nGender - \`${genderLabel}\`\nVariant - \`${variantLabel}\``;

      const embed = renderEmbedHeader(
        title,
        payload.authorIcon,
        payload.pokemonIcon,
      );

      embed
        .setDescription(
          `${description}\n\n${details}\n\nType - ${pokemonTypes}`,
        )
        .setImage(payload.pokemonImage)
        .setFooter({ text: `Caught: ${new Date()}` });

      await interaction.deferUpdate();
      await interaction.editReply({ embeds: [embed], components: [] });

      await saveCatch({
        discord_id: interaction.user.id,
        pokemon_id: payload.id,
        gender: payload.gender,
        variant: 'normal',
        shiny: payload.shiny,
        ball_used: pokeball.type,
      });

      return;
    }

    payload.attempts -= 1;

    const title = `A wild ${payload.shiny ? 'Shiny ' : ''}${payload.name} appeared!`;
    const titleLost = `${payload.shiny ? 'Shiny ' : ''}${payload.name} ran away!`;

    const description =
      payload.attempts < 2
        ? 'That was so close! Should we try again?'
        : 'The Pokémon broke free! Try again?';

    const embed = renderEmbedHeader(
      title,
      payload.authorIcon,
      payload.pokemonIcon,
    );

    if (payload.attempts === 0) {
      state.exploreList.delete(interaction.user.id);

      embed
        .setTitle(titleLost)
        .setDescription(FLEE_PROMPTS[payload.rarity])
        .setFooter({ text: `Seen: ${new Date()}` });

      await interaction.deferUpdate();
      await interaction.editReply({ embeds: [embed], components: [] });
      return;
    }

    embed
      .setDescription(description)
      .setImage(payload.pokemonImage)
      .setFooter({
        text: `Rarity: ${rarityLabel}  |  Gender: ${genderLabel}  |  Variant: ${variantLabel}`,
      });

    const row = await getExploreActions(interaction.user.id);

    await interaction.deferUpdate();
    await interaction.editReply({ embeds: [embed], components: [row] });
  },
  /**
   * Handles a Run button click. Ends the encounter and updates the embed.
   *
   * @param state - Global bot state
   * @param interaction - The button interaction
   */
  onRunClick: async (state: BotState, interaction: ButtonInteraction) => {
    const payload = state.exploreList.get(interaction.user.id);

    if (!payload) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    state.exploreList.delete(interaction.user.id);

    const title = `You encountered a wild ${payload.shiny ? 'Shiny ' : ''}${payload.name}!`;

    const embed = renderEmbedHeader(
      title,
      payload.authorIcon,
      payload.pokemonIcon,
    );

    embed.setDescription(RUN_PROMPTS[payload.rarity]).setFooter({
      text: `Seen: ${new Date()}`,
    });

    await interaction.deferUpdate();
    await interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
};
