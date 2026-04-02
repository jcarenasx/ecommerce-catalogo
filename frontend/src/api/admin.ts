import type { Product, ProductInput } from "../types";
import { api } from "../lib/api";

export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await api.post<{ product: Product }>("/products", input);
  return response.data.product;
}

export async function editProduct(
  productModel: string,
  input: ProductInput
): Promise<Product> {
  const response = await api.put<{ product: Product }>(`/products/${productModel}`, input);
  return response.data.product;
}

export async function removeProduct(productModel: string): Promise<void> {
  await api.delete(`/products/${productModel}`);
}

export async function uploadMedia(formData: FormData): Promise<string[]> {
  const response = await api.post<{ urls: string[] }>("/media/upload", formData);
  return response.data.urls;
}
