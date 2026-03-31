import { useQuery } from "@tanstack/react-query";
import { loadBrandFilters } from "../services/productService";

export function useProductBrands(includeInactive = false) {
  return useQuery<string[]>({
    queryKey: ["productBrands", includeInactive],
    queryFn: () => loadBrandFilters(includeInactive),
    staleTime: 60_000,
  });
}
