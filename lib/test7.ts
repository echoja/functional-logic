import { pipe } from "./pipe";
import { getNextSinceProductId, getProducts, getProductsCount } from "./test";

export type CountGetter = () => Promise<{ count: number }>;

export type SinceIdGetter<T> = (result: { items: T[] }) => {
  sinceId: number;
};

export interface IGetResponse<T> {
  items: T[];
}

export interface IGetResponseWithDuration<T> extends IGetResponse<T> {
  duration: number;
}

export type Action<T, R> = (arg: R) => Promise<T>;

export type WithDuration<T> = T & { duration: number };

export function durationFn<T, R>(
  action: Action<T, R>
): Action<WithDuration<T>, R> {
  return async function duration(arg: R) {
    const start = new Date();
    const result = await action(arg);
    const end = new Date();
    const duration = end.getTime() - start.getTime();
    return { ...result, duration };
  };
}

export function getAllItemsFn<T, R>(
  getCount: CountGetter,
  getNextSinceItemId: SinceIdGetter<T>
) {
  return function getAllItems(
    fn: Action<{ items: T[] }, R>
  ): Action<{ items: T[] }, R> {
    return async function getAllItems(arg) {
      let { count: remainCount } = await getCount();
      let sinceId = 0;
      const result: T[] = [];

      while (remainCount > 0) {
        const response = await fn({ ...arg, sinceId });
        result.push(...response.items);
        sinceId = getNextSinceItemId(response).sinceId;
        remainCount -= response.items.length;
      }

      return { items: result };
    };
  };
}

export const getAllProducts = pipe(
  getProducts,
  getAllItemsFn(getProductsCount, getNextSinceProductId),
  durationFn
);
