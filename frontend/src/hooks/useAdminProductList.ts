import { useQuery } from "@tanstack/react-query";
import { loadProducts, type ProductListResult } from "../services/productService";

type UseAdminProductListParams = {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export function useAdminProductList(params: UseAdminProductListParams) {
  return useQuery<ProductListResult>({
    queryKey: [
      "admin-products",
      params.category ?? null,
      params.search ?? null,
      params.offset ?? null,
      params.limit ?? null,
    ],
    queryFn: () =>
      loadProducts({
        category: params.category,
        search: params.search,
        includeInactive: true,
        limit: params.limit,
        offset: params.offset,
      }),
    staleTime: 60_000,
  });
}
