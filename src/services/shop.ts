import { DEFAULT_SHOP_STATE } from '@/constants/pokemon';
import { log } from '@/discord/helpers';
import { LogCode } from '@/enums/logs';
import { ShopDocument, ShopState } from '@/interfaces/shop';
import { ShopModel } from '@/models/shop';

export const findOrCreateShop = async (): Promise<ShopDocument | null> => {
  try {
    return await ShopModel.findOneAndUpdate(
      {},
      { $setOnInsert: DEFAULT_SHOP_STATE },
      { returnDocument: 'after', upsert: true },
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
    return await ShopModel.findOneAndUpdate(
      {},
      { $set: stock },
      { returnDocument: 'after' },
    );
  } catch (error) {
    log({ type: LogCode.Error, description: JSON.stringify(error) });
    return null;
  }
};
