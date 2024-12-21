import { getNextSinceProductId, getProducts, getProductsCount } from "./test";
import { IArgs } from "./types";

export type CountGetter = () => Promise<{ count: number }>;

export type SinceIdGetter<T> = (result: IGetResponse<T>) => {
  sinceId: number;
};

export interface IGetResponse<T> {
  items: T[];
}

export async function getAllItems<T>(
  getCount: CountGetter,
  getItems: (arg: IArgs) => Promise<IGetResponse<T>>,
  getNextSinceItemId: SinceIdGetter<T>
): Promise<IGetResponse<T>> {
  let { count: remainCount } = await getCount();
  let sinceId = 0;
  const result: T[] = [];

  while (remainCount > 0) {
    const response = await getItems({ sinceId });
    result.push(...response.items);
    sinceId = getNextSinceItemId(response).sinceId;
    remainCount -= response.items.length;
  }

  return { items: result };
}

export function getAllProducts() {
  return getAllItems(getProductsCount, getProducts, getNextSinceProductId);
}
