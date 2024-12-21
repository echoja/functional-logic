/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export function pipe<T>(initialValue: T, ...fns: Function[]) {
  return fns.reduce((value, fn) => fn(value), initialValue);
}
