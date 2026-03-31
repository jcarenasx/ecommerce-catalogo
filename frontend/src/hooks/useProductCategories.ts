import { useQuery } from "@tanstack/react-query";
import { loadCategoryFilters } from "../services/productService";

export function useProductCategories(includeInactive = false) {
  return useQuery<string[]>({
    queryKey: ["productCategories", includeInactive],
    queryFn: () => loadCategoryFilters(includeInactive),
    staleTime: 60_000,
  });
}
