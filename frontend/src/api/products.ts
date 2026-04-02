import { api } from "../lib/api";
import type { Product } from "../types";

const PRODUCTS_BASE_PATH = "/products";

export type ProductsApiResponse = {
  products: Product[];
  total: number;
};

export async function fetchProducts(
  category?: string,
  brand?: string,
  includeInactive = false,
  search?: string,
  limit?: number,
  offset?: number
): Promise<ProductsApiResponse> {
  const params: Record<string, string> = {};
  if (category) {
    params.category = category;
  }
  if (brand) {
    params.brand = brand;
  }
  if (includeInactive) {
    params.includeInactive = "true";
  }
  if (search) {
    params.search = search;
  }
  if (typeof limit === "number") {
    params.limit = String(limit);
  }
  if (typeof offset === "number") {
    params.offset = String(offset);
  }

  const response = await api.get<ProductsApiResponse>(PRODUCTS_BASE_PATH, {
    ...(Object.keys(params).length > 0 ? { params } : {}),
  });

  return response.data;
}

export async function fetchProductCategories(includeInactive = false): Promise<string[]> {
  const params = includeInactive ? { includeInactive: "true" } : undefined;
  const response = await api.get<{ categories: string[] }>(`${PRODUCTS_BASE_PATH}/categories`, {
    params,
  });
  return response.data.categories;
}

export async function fetchProductBrands(includeInactive = false): Promise<string[]> {
  const params = includeInactive ? { includeInactive: "true" } : undefined;
  const response = await api.get<{ brands: string[] }>(`${PRODUCTS_BASE_PATH}/brands`, {
    params,
  });
  return response.data.brands;
}
