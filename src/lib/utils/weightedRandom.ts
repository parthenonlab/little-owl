/**
 * Selects a random key from an object based on its weights.
 *
 * @param toRandomize - Object of weights, where each key is an option and each value is a non-negative number.
 * @returns The selected key.
 */
export const weightedRandom = (toRandomize: Record<string, number>): string => {
  if (!toRandomize || Object.keys(toRandomize).length === 0) {
    throw new Error('weightedRandom requires a non-empty object');
  }

  let sum = 0;
  for (const value of Object.values(toRandomize)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('weightedRandom values must be valid numbers');
    }
    if (value < 0) {
      throw new Error('weightedRandom values must be non-negative');
    }
    sum += value;
  }

  if (sum === 0) {
    throw new Error('weightedRandom requires at least one positive weight');
  }

  const r = Math.random() * sum;
  let cumulative = 0;

  for (const [key, value] of Object.entries(toRandomize)) {
    cumulative += value;
    if (r < cumulative) {
      return key;
    }
  }

  // Fallback: numeric precision can cause rounding to exactly sum.
  return Object.keys(toRandomize)[Object.keys(toRandomize).length - 1];
};
