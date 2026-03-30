import { PokemonRarity } from '@/interfaces/pokemon';

export const RUN_PROMPTS: Record<PokemonRarity, string> = {
  common: 'You moved on, leaving the Pokémon behind.',
  uncommon: 'You left it behind and continued on your way.',
  rare: 'You paused for a moment, then chose to move on.',
  'very rare': 'You walked away, but the encounter stayed on your mind.',
  legendary: 'You stepped away, knowing that one was different.',
  mythical: "You moved on, unsure if you'll see one like it again.",
};
