import { ShopState } from '@/interfaces/shop';

export const DEFAULT_SHOP_STATE: ShopState = {
  pokeball: 250,
  greatball: 100,
  ultraball: 50,
  masterball: 1,
  lastDailyRestock: new Date(),
  lastWeeklyRestock: new Date(),
};

export const BALL_LABELS = {
  pokeball: 'Poké Balls',
  greatball: 'Great Balls',
  ultraball: 'Ultra Balls',
  masterball: 'Master Balls',
};

export const SHOP_PRICES = {
  pokeball: 200,
  greatball: 400,
  ultraball: 800,
  masterball: 1000000,
};
