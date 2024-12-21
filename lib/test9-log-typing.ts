import { getProductsCountMock, getProductsMock } from "./data";
import { pipe } from "./pipe";
import { getNextSinceProductId, getProducts, getProductsCount } from "./test";

// log start

// export function getErrorObj(error: Error): Record<string, unknown> {
//   const obj = {
//     type: "error",
//     message: error.message,
//     cause: error.cause,
//     stack: error.stack,
//   };
//   const errorInfo = (error as { errorInfo?: ErrorInfo }).errorInfo;

//   if (errorInfo) {
//     Object.assign(obj, { errorInfo });
//   }
//   return obj;
// }

export type ErrorInfo = Record<string, unknown>;

export type Log = (msg: string | object) => void;

export type WithLog<T> = T & { log?: Log };

export function logWithId(msg: string | object, key: string) {
  const current = new Date();
  if (typeof msg === "string") {
    console.log(JSON.stringify({ timestamp: current.toISOString(), key, msg }));
    return;
  }

  console.log(
    JSON.stringify({ timestamp: current.toISOString(), key, ...msg })
  );
}

export function createLog(key: string): Log {
  return function log(msg) {
    logWithId(msg, key);
  };
}

const defaultLog = createLog("default");

export function logFn<T, R>(log = defaultLog) {
  return function _log(fn: Action<T, WithLog<R>>): Action<T, R> {
    return async function _log(arg) {
      return fn({ ...arg, log });
    };
  };
}

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
): Action<WithDuration<T>, WithLog<R>> {
  return async function duration(arg) {
    const start = new Date();
    const result = await action(arg);
    const end = new Date();
    const duration = end.getTime() - start.getTime();
    arg.log?.(`duration: ${duration}`);
    return { ...result, duration };
  };
}

export function getAllItemsFn<T, R>(
  getCount: CountGetter,
  getNextSinceItemId: SinceIdGetter<T>
) {
  return function getAllItems(
    fn: Action<{ items: T[] }, R & { sinceId: number }>
  ): Action<{ items: T[] }, WithLog<R>> {
    return async function getAllItems(arg) {
      let { count: remainCount } = await getCount();
      arg.log?.("initial remainCount: " + remainCount);
      let sinceId = 0;
      const result: T[] = [];

      while (remainCount > 0) {
        const response = await fn({ ...arg, sinceId });
        arg.log?.({
          message: "success response",
          length: response.items.length,
          remainCount,
          sinceId,
        });
        result.push(...response.items);
        sinceId = getNextSinceItemId(response).sinceId;
        arg.log?.(`next sinceId: ${sinceId}`);
        remainCount -= response.items.length;
        arg.log?.(`next remainCount: ${remainCount}`);
      }

      arg.log?.(`success get all items: ${result.length}`);

      return { items: result };
    };
  };
}

export const getAllProducts = pipe(
  getProducts,
  getAllItemsFn(getProductsCount, getNextSinceProductId),
  durationFn,
  logFn()
);

export const getAllProductsMock = pipe(
  getProductsMock,
  getAllItemsFn(getProductsCountMock, getNextSinceProductId),
  durationFn
);
