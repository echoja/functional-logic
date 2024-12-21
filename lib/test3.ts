import { getNextSinceProductId, getProducts, getProductsCount } from "./test";

export type CountGetter = () => Promise<{ count: number }>;

export type SinceIdGetter<T> = (result: IGetResponse<T>) => {
  sinceId: number;
};

export interface IGetResponse<T> {
  items: T[];
}

export function getAllItemsFn<T, R extends { sinceId: number }>(
  getCount: CountGetter,
  getItems: (arg: R) => Promise<IGetResponse<T>>,
  getNextSinceItemId: SinceIdGetter<T>
) {
  return async function getAllItems(arg: R): Promise<IGetResponse<T>> {
    let { count: remainCount } = await getCount();
    let sinceId = 0;
    const result: T[] = [];

    while (remainCount > 0) {
      const response = await getItems({ ...arg, sinceId });
      result.push(...response.items);
      sinceId = getNextSinceItemId(response).sinceId;
      remainCount -= response.items.length;
    }

    return { items: result };
  };
}

export const getAllProducts = getAllItemsFn(
  getProductsCount,
  getProducts,
  getNextSinceProductId
);
