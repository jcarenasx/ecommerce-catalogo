import type { Prisma, Product } from "@prisma/client";
import { prisma } from "../prisma";

export type ProductMutationInput = {
  name?: string | null;
  size?: string | null;
  color?: string | null;
  model: string;
  sku?: string | null;
  priceCents?: number | null;
  paymentLinkWithShipping?: string | null;
  paymentLinkWithoutShipping?: string | null;
  category?: string | null;
  brand?: string | null;
  images?: (string | null)[] | null;
};

function normalizeNullableString(value?: string | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeGallery(value?: (string | null)[] | null): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeNullableString(item))
    .filter((item): item is string => typeof item === "string");
}

function buildProductPayload(data: ProductMutationInput): Prisma.ProductCreateInput {
  const trimmedModel = data.model.trim();
  const fallbackName = normalizeNullableString(data.name) ?? trimmedModel;

  return {
    name: fallbackName,
    size: normalizeNullableString(data.size),
    color: normalizeNullableString(data.color),
    model: trimmedModel,
    sku: normalizeNullableString(data.sku),
    priceCents: data.priceCents ?? null,
    paymentLinkWithShipping: normalizeNullableString(data.paymentLinkWithShipping),
    paymentLinkWithoutShipping: normalizeNullableString(data.paymentLinkWithoutShipping),
    category: normalizeNullableString(data.category),
    brand: normalizeNullableString(data.brand),
    images: normalizeGallery(data.images),
  };
}

export async function createProduct(data: ProductMutationInput): Promise<Product> {
  const payload = buildProductPayload(data);
  return prisma.product.create({ data: payload });
}

export async function updateProduct(
  currentModel: string,
  data: ProductMutationInput
): Promise<Product> {
  const payload = buildProductPayload(data);
  return prisma.product.update({
    where: { model: currentModel },
    data: payload,
  });
}

export async function getUniqueCategories(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: {
      category: {
        not: null,
      },
    },
    distinct: ["category"],
    select: {
      category: true,
    },
  });

  return rows.map((row) => row.category!).filter(Boolean);
}
