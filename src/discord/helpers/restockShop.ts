import { BotState } from '@/interfaces/bot';

export const restockShopDaily = (state: BotState) => {
  state.shop.pokeball = 250;
  state.shop.greatball = 100;
  state.shop.ultraball = 50;
  state.shop.lastDailyRestock = new Date();
};

export const restockShopWeekly = (state: BotState) => {
  state.shop.masterball = 1;
  state.shop.lastWeeklyRestock = new Date();
};
