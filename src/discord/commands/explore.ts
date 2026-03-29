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

import {
  BASE_POKEMON_IMAGE_URL,
  POKEMON_LIST,
  POKEMON_RARITY,
  POKEMON_SHINY,
} from '@/constants/pokemon';

import { LogCode } from '@/enums/logs';
import { weightedRandom } from '@/lib/utils';

import { log, reply } from '../helpers';

export const Explore = {
  data: new SlashCommandBuilder()
    .setName(COPY.EXPLORE.NAME)
    .setDescription(COPY.EXPLORE.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    // user: UserDocument,
  ) => {
    if (!CONFIG.FEATURES.EXPLORE.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const rarity = weightedRandom(POKEMON_RARITY);
    const pokemonPool = POKEMON_LIST.filter(p => p.rarity === rarity);
    const selectedPokemon =
      pokemonPool[Math.floor(Math.random() * pokemonPool.length)];

    const gender = selectedPokemon.genderRatio
      ? weightedRandom(selectedPokemon.genderRatio)
      : null;

    const variant = weightedRandom(POKEMON_SHINY);
    const isShiny = variant === 'shiny';

    let imageName = variant;

    if (gender === 'female' && selectedPokemon.hasFemaleImage) {
      imageName = isShiny ? `${gender}-shiny` : gender;
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('catch_pokeball')
          .setEmoji(EMOJIS.POKEMON.POKEBALL)
          .setLabel('Use (17)')
          .setStyle(ButtonStyle.Secondary),
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('catch_greatball')
          .setEmoji(EMOJIS.POKEMON.GREATBALL)
          .setLabel('Use (3)')
          .setStyle(ButtonStyle.Secondary),
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('run')
          .setLabel('Run Away')
          .setStyle(ButtonStyle.Secondary),
      );

    try {
      const authorText = `Exploring...`;
      const titleText = `You found a wild ${isShiny ? 'Shiny ' : ''}${selectedPokemon.name}!`;

      const pokemonImage = `${BASE_POKEMON_IMAGE_URL}/${selectedPokemon.id}/${imageName}.gif`;

      const footerText = `Rarity: ${rarity} | Gender: ${gender || 'N/A'} | Variant: ${variant}`;

      const botEmbed = new EmbedBuilder()
        .setColor(CONFIG.COLORS.GREEN as ColorResolvable)
        .setAuthor({
          name: authorText,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(titleText)
        .setDescription('Catch it or run away by reacting below.')
        .setImage(pokemonImage)
        .setFooter({
          text: footerText,
        });

      await interaction.reply({
        embeds: [botEmbed],
        components: [row],
      });
    } catch (error) {
      log({
        type: LogCode.Error,
        description: JSON.stringify(error),
      });
    }
  },
  getName: (): string => {
    return COPY.EXPLORE.NAME;
  },
};
