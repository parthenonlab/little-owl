export const POKEMON_RARITY_WEIGHTS: Record<string, number> = {
  common: 0.45,
  uncommon: 0.25,
  rare: 0.2,
  'very rare': 0.07,
  legendary: 0.019,
  mythical: 0.011,
};

export const POKEMON_SHINY_WEIGHTS: Record<string, number> = {
  normal: 0.9990234375,
  shiny: 0.0009765625, // 1 in 1024 chance
};

export const POKEMON_SHINY_CHARM_WEIGHTS: Record<string, number> = {
  normal: 0.998046875,
  shiny: 0.001953125, // 1 in 512 chance
};
