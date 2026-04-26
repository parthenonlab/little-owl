import { CONFIG } from '@/constants';

/**
 * Returns the singular or plural currency label based on the value.
 *
 * @param value - The amount of currency.
 * @returns The appropriate currency label.
 */
export const getCurrency = (value: number): string => {
  return value > 1 ? CONFIG.CURRENCY.PLURAL : CONFIG.CURRENCY.SINGLE;
};
