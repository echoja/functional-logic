export interface IProduct {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
}

export interface IArgs {
  sinceId: number;
}

export interface IGetProductsResponse {
  items: IProduct[];
}

// export type CountGetter<R> = (args: R) => Promise<{ count: number }>;

export type CountGetter = () => Promise<{ count: number }>;

export type SinceIdGetter<T> = (result: { items: T[] }) => {
  sinceId: number;
};

export interface IGetResponse<T> {
  items: T[];
}
