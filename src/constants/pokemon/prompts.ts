import { PokemonRarity } from '@/interfaces/pokemon';

export const RUN_PROMPTS: Record<PokemonRarity, string> = {
  common: 'You moved on, leaving the Pokémon behind.',
  uncommon: 'You left it behind and continued on your way.',
  rare: 'You paused for a moment, then chose to move on.',
  'very rare': 'You walked away, but the encounter stayed on your mind.',
  legendary: 'You stepped away, knowing that one was different.',
  mythical: "You moved on, unsure if you'll see one like it again.",
};

export const FLEE_PROMPTS: Record<PokemonRarity, string> = {
  common: 'The Pokémon fled before you could catch it.',
  uncommon: 'It slipped away before you had a chance.',
  rare: 'It disappeared into the wild before you could catch it.',
  'very rare': "It escaped. That kind of encounter won't come easily again.",
  legendary: 'It vanished, leaving you wondering if it was ever really there.',
  mythical: "It was gone in an instant, like it was never there at all.",
};
