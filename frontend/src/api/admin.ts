import type { Product, ProductInput } from "../types";
import client from "./client";

export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await client.post<{ product: Product }>("/products", input);
  return response.data.product;
}

export async function editProduct(
  productModel: string,
  input: ProductInput
): Promise<Product> {
  const response = await client.put<{ product: Product }>(`/products/${productModel}`, input);
  return response.data.product;
}

export async function removeProduct(productModel: string): Promise<void> {
  await client.delete(`/products/${productModel}`);
}

export async function uploadMedia(formData: FormData): Promise<string[]> {
  const response = await client.post<{ urls: string[] }>("/media/upload", formData);
  return response.data.urls;
}
