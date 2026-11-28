import { DEFAULT_SHOP_STATE } from '@/constants/pokemon';
import { ShopDocument, ShopState } from '@/interfaces/shop';
import { logger } from '@/lib/logger';
import { ShopModel } from '@/models/shop';

export const findOrCreateShop = async (): Promise<ShopDocument | null> => {
  try {
    return await ShopModel.findOneAndUpdate(
      {},
      { $setOnInsert: DEFAULT_SHOP_STATE },
      { returnDocument: 'after', upsert: true },
    );
  } catch (error) {
    logger.error({ err: error }, 'Failed to find or create shop');
    return null;
  }
};

export const setShopStock = async (
  stock: Partial<ShopState>,
): Promise<ShopDocument | null> => {
  try {
    return await ShopModel.findOneAndUpdate(
      {},
      { $set: stock },
      { returnDocument: 'after' },
    );
  } catch (error) {
    logger.error({ err: error, stock }, 'Failed to set shop stock');
    return null;
  }
};
