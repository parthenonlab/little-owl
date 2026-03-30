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
  POKEMON_IMAGE_URLS,
  POKEMON_LIST,
  POKEMON_RARITY_WEIGHTS,
  POKEMON_SHINY_WEIGHTS,
} from '@/constants/pokemon';

import { LogCode } from '@/enums/logs';
import { BotState } from '@/interfaces/bot';
import { PokemonExplorePayload } from '@/interfaces/pokemon';
import { capitalize, weightedRandom } from '@/lib/utils';

import { getActiveSpawn, getExploreActions, log, reply } from '../helpers';

const renderEmbedHeader = async ({
  authorIcon,
  name,
  pokemonIcon,
  shiny,
}: PokemonExplorePayload) => {
  const title = `You found a wild ${shiny ? 'Shiny ' : ''}${name}!`;

  const embed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.POKEMON.RED as ColorResolvable)
    .setAuthor({
      name: 'Exploring...',
      iconURL: authorIcon,
    })
    .setTitle(title)
    .setThumbnail(pokemonIcon);

  return embed;
};

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

    if (state.exploreList.has(interaction.user.id)) {
      reply({
        content: 'There is currently a Pokémon in front of you!',
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    const activeSpawn = getActiveSpawn();
    const rarity = weightedRandom(POKEMON_RARITY_WEIGHTS);

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
      rarity: rarityLabel,
      gender: genderLabel,
      variant: variantLabel,
      shiny: isShiny,
      pokemonIcon,
      authorIcon: interaction.user.displayAvatarURL(),
    };

    state.exploreList.set(interaction.user.id, payload);

    try {
      const row = await getExploreActions(interaction.user.id);
      const embed = await renderEmbedHeader(payload);

      embed
        .setDescription('Catch it or run away with the buttons below!')
        .setImage(pokemonImage)
        .setFooter({
          text: `Rarity: ${rarityLabel}  |  Gender: ${genderLabel}  |  Variant: ${variantLabel}`,
        });

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
  getName: (): string => {
    return COPY.EXPLORE.NAME;
  },
  onRunClick: async (state: BotState, interaction: ButtonInteraction) => {
    const payload = state.exploreList.get(interaction.user.id);

    if (!payload) {
      await interaction.reply({
        content: COPY.ERROR.GENERIC,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = await renderEmbedHeader(payload);

    embed.setDescription('Got away safely!').setFooter({
      text: `Encountered: ${new Date()}`,
    });

    state.exploreList.delete(interaction.user.id);

    await interaction.deferUpdate();
    await interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
};
