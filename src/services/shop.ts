import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ShopDocument, ShopState } from '@/interfaces/shop';
import { ShopModel } from '@/models/shop';
import { DEFAULT_SHOP_STATE } from '@/constants/pokemon/shop';

export const findOrCreateShop = async (): Promise<ShopDocument | null> => {
  try {
    return await ShopModel.findOneAndUpdate(
      {},
      { $setOnInsert: DEFAULT_SHOP_STATE },
      { new: true, upsert: true },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};

export const updateShopStock = async (
  stock: Partial<ShopState>,
): Promise<ShopDocument | null> => {
  try {
    return await ShopModel.findOneAndUpdate({}, { $set: stock }, { new: true });
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};
