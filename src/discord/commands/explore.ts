import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY } from '@/constants';

import {
  POKEMON_IMAGE_URLS,
  POKEMON_LIST,
  POKEMON_RARITY_WEIGHTS,
  POKEMON_SHINY_WEIGHTS,
} from '@/constants/pokemon';

import { LogCode } from '@/enums/logs';
import { BotState } from '@/interfaces/bot';
import { capitalize, getExploreActions, weightedRandom } from '@/lib/utils';

import { log, reply } from '../helpers';

export const Explore = {
  data: new SlashCommandBuilder()
    .setName(COPY.EXPLORE.NAME)
    .setDescription(COPY.EXPLORE.DESCRIPTION),
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

    if (state.exploreList.includes(interaction.user.id)) {
      reply({
        content: 'There is currently a Pokémon in front of you!',
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    state.exploreList.push(interaction.user.id);

    const row = await getExploreActions(interaction.user.id);

    const rarity = weightedRandom(POKEMON_RARITY_WEIGHTS);
    const pokemonPool = POKEMON_LIST.filter(p => p.rarity === rarity);
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

    const titleText = `You found a wild ${isShiny ? 'Shiny ' : ''}${selectedPokemon.name}!`;
    const pokemonImage = `${POKEMON_IMAGE_URLS.base}/pokemon/${selectedPokemon.id}/${imageName}.gif`;
    const pokemonIcon = `${POKEMON_IMAGE_URLS.pokemondb}/${variant}/${iconName}.png`;

    const rarityLabel = capitalize(rarity);
    const genderLabel = gender ? capitalize(gender) : 'N/A';
    const variantLabel = capitalize(variant);

    const footerText = `Rarity: ${rarityLabel}  |  Gender: ${genderLabel}  |  Variant: ${variantLabel}`;

    try {
      const botEmbed = new EmbedBuilder()
        .setColor(CONFIG.COLORS.GREEN as ColorResolvable)
        .setAuthor({
          name: 'Exploring...',
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(titleText)
        .setDescription('Catch it or run away with the buttons below!')
        .setThumbnail(pokemonIcon)
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
