import { prisma } from "../prisma";
import type { Product, Prisma } from "@prisma/client";

export type ProductFindManyOptions = {
  category?: string;
  brand?: string;
  includeInactive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

function normalizeImages(product: Product): Product {
  return {
    ...product,
    images: product.images ?? [],
    brand: product.brand ?? null,
  };
}

function wrapProduct(product: Product): Product {
  return normalizeImages(product);
}

export const productRepository = {
  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data }).then(wrapProduct);
  },

  update(model: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { model },
      data,
    }).then(wrapProduct);
  },

  delete(model: string): Promise<Product> {
    return prisma.product.delete({ where: { model } }).then(wrapProduct);
  },

  findUnique(model: string): Promise<Product | null> {
    return prisma.product
      .findUnique({ where: { model } })
      .then((product) => (product ? normalizeImages(product) : null));
  },

  findMany(options: ProductFindManyOptions): Promise<{ products: Product[]; total: number }> {
    const where: Prisma.ProductWhereInput = {};
    if (options.category) {
      where.category = options.category;
    }
    if (options.brand) {
      where.brand = options.brand;
    }
    if (!options.includeInactive) {
      where.active = true;
    }

    if (options.search) {
      const value = options.search.trim();
      if (value !== "") {
        where.OR = [
          { name: { contains: value, mode: "insensitive" } },
          { model: { contains: value, mode: "insensitive" } },
        ];
      }
    }

    const queryArgs: Prisma.ProductFindManyArgs = {
      where,
      orderBy: { model: "asc" },
    };
    if (typeof options.offset === "number") {
      queryArgs.skip = options.offset;
    }
    if (typeof options.limit === "number" && options.limit > 0) {
      queryArgs.take = options.limit;
    }

    return Promise.all([
      prisma.product.findMany(queryArgs),
      prisma.product.count({ where }),
    ]).then(([products, total]) => ({
      products: products.map(normalizeImages),
      total,
    }));
  },

  getDistinctCategories(includeInactive = false): Promise<string[]> {
    const where: Prisma.ProductWhereInput = {
      category: { not: null },
    };
    if (!includeInactive) {
      where.active = true;
    }

    return prisma.product
      .findMany({
        where,
        select: { category: true },
        distinct: ["category"],
      })
      .then((items) => items.map((item) => item.category!).filter(Boolean));
  },

  getDistinctBrands(includeInactive = false): Promise<string[]> {
    const where: Prisma.ProductWhereInput = {
      brand: { not: null },
    };
    if (!includeInactive) {
      where.active = true;
    }

    return prisma.product
      .findMany({
        where,
        select: { brand: true },
        distinct: ["brand"],
      })
      .then((items) => items.map((item) => item.brand!).filter(Boolean));
  },
};
