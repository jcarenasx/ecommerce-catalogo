import type { Product, ProductInput } from "../types";
import { fetchProducts, fetchProductBrands, fetchProductCategories } from "../api/products";
import {
  createProduct as createProductApi,
  editProduct as editProductApi,
  removeProduct as deleteProductApi,
} from "../api/admin";

type ProductApiRecord = Partial<Product> & Pick<Product, "model">;

function normalizeImageList(value?: string[] | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}

function normalizeProduct(product: ProductApiRecord): Product {
  return {
    ...product,
    name: product.name?.trim() || product.model,
    size: product.size ?? null,
    color: product.color ?? null,
    sku: product.sku ?? null,
    category: product.category ?? null,
    brand: product.brand ?? null,
    images: normalizeImageList(product.images),
    priceCents: product.priceCents ?? null,
    paymentLinkWithShipping: product.paymentLinkWithShipping ?? null,
    paymentLinkWithoutShipping: product.paymentLinkWithoutShipping ?? null,
    active: product.active ?? true,
    createdAt: product.createdAt ?? "",
    updatedAt: product.updatedAt ?? "",
  };
}

function normalizeOptionalText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeInput(input: ProductInput): ProductInput {
  return {
    ...input,
    category: normalizeOptionalText(input.category),
    brand: normalizeOptionalText(input.brand),
    images: normalizeImageList(input.images),
  };
}

export type LoadProductsOptions = {
  category?: string;
  brand?: string;
  includeInactive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ProductListResult = {
  products: Product[];
  total: number;
};

export async function loadProducts(
  options: LoadProductsOptions = {}
): Promise<ProductListResult> {
  const response = await fetchProducts(
    options.category,
    options.brand,
    options.includeInactive ?? false,
    options.search,
    options.limit,
    options.offset
  );

  return {
    total: response.total ?? 0,
    products: response.products.map(normalizeProduct),
  };
}

export async function loadCategories(includeInactive = false): Promise<string[]> {
  return fetchProductCategories(includeInactive);
}

export async function loadCategoryFilters(includeInactive = false): Promise<string[]> {
  return fetchProductCategories(includeInactive);
}

export async function loadBrandFilters(includeInactive = false): Promise<string[]> {
  return fetchProductBrands(includeInactive);
}

export async function createCatalogProduct(input: ProductInput): Promise<Product> {
  return createProductApi(normalizeInput(input));
}

export async function updateCatalogProduct(
  productModel: string,
  input: ProductInput
): Promise<Product> {
  return editProductApi(productModel, normalizeInput(input));
}

export async function deleteCatalogProduct(productModel: string): Promise<void> {
  return deleteProductApi(productModel);
}
