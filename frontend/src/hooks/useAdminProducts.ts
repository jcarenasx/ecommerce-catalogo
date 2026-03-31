import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} from "../services/productService";
import type { Product, ProductInput } from "../types";

type EditProductInput = {
  productModel: string;
  input: ProductInput;
};

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const refreshProducts = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    ]);
  };

  const createProductMutation = useMutation({
    mutationFn: (input: ProductInput): Promise<Product> => createCatalogProduct(input),
    onSuccess: refreshProducts,
  });

  const editProductMutation = useMutation({
    mutationFn: ({ productModel, input }: EditProductInput): Promise<Product> =>
      updateCatalogProduct(productModel, input),
    onSuccess: refreshProducts,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productModel: string): Promise<void> => deleteCatalogProduct(productModel),
    onSuccess: refreshProducts,
  });

  return {
    createProduct: createProductMutation,
    editProduct: editProductMutation,
    deleteProduct: deleteProductMutation,
  };
}
