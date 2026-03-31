import { useQuery } from "@tanstack/react-query";
import { loadProducts } from "../services/productService";
import type { Product } from "../types";

type ProductFilters = {
  category?: string;
  brand?: string;
};

type UseProductsOptions = {
  includeInactive?: boolean;
};

export function useProducts(filters?: ProductFilters, options?: UseProductsOptions) {
  const includeInactive = options?.includeInactive ?? false;
  return useQuery<Product[]>({
    queryKey: [
      "products",
      filters?.category ?? null,
      filters?.brand ?? null,
      includeInactive,
    ],
    queryFn: () =>
      loadProducts({
        category: filters?.category,
        brand: filters?.brand,
        includeInactive,
      }).then((result) => result.products),
    staleTime: 60_000,
  });
}
