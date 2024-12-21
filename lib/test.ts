import { IArgs, IGetProductsResponse, IProduct } from "./types";

export async function getProducts(args: IArgs): Promise<IGetProductsResponse> {
  const response = await fetch(
    "https://fakestoreapi.com/products?sinceId=" + args.sinceId
  );
  const products = await response.json();
  return { items: products };
}

export async function getProductsCount(): Promise<{ count: number }> {
  const response = await fetch("https://fakestoreapi.com/products/count");
  const count = await response.json();
  return { count };
}

export function getNextSinceProductId(response: IGetProductsResponse): {
  sinceId: number;
} {
  return { sinceId: Math.max(...response.items.map((item) => item.id)) };
}

export async function getAllProducts(): Promise<IGetProductsResponse> {
  let { count: remainCount } = await getProductsCount();
  let sinceId = 0;
  const result: IProduct[] = [];

  while (remainCount > 0) {
    const response = await getProducts({ sinceId });
    result.push(...response.items);
    sinceId = getNextSinceProductId(response).sinceId;
    remainCount -= response.items.length;
  }

  return { items: result };
}
