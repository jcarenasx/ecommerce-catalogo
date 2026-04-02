import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export type ProductFindManyOptions = {
  category?: string;
  brand?: string;
  includeInactive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

const defaultProductInclude = {
  availabilityTag: true,
} satisfies Prisma.ProductInclude;

export type ProductRecord = Prisma.ProductGetPayload<{
  include: typeof defaultProductInclude;
}>;

function normalizeProduct(product: ProductRecord): ProductRecord {
  return {
    ...product,
    images: product.images ?? [],
    brand: product.brand ?? null,
    availabilityTag: product.availabilityTag ?? null,
  };
}

function wrapProduct(product: ProductRecord): ProductRecord {
  return normalizeProduct(product);
}

export const productRepository = {
  create(data: Prisma.ProductUncheckedCreateInput): Promise<ProductRecord> {
    return prisma.product
      .create({
        data,
        include: defaultProductInclude,
      })
      .then(wrapProduct);
  },

  update(model: string, data: Prisma.ProductUncheckedUpdateInput): Promise<ProductRecord> {
    return prisma.product
      .update({
        where: { model },
        data,
        include: defaultProductInclude,
      })
      .then(wrapProduct);
  },

  delete(model: string): Promise<ProductRecord> {
    return prisma.product
      .delete({
        where: { model },
        include: defaultProductInclude,
      })
      .then(wrapProduct);
  },

  findUnique(model: string): Promise<ProductRecord | null> {
    return prisma.product
      .findUnique({
        where: { model },
        include: defaultProductInclude,
      })
      .then((product) => (product ? normalizeProduct(product) : null));
  },

  findMany(options: ProductFindManyOptions): Promise<{ products: ProductRecord[]; total: number }> {
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

    const queryArgs = Prisma.validator<Prisma.ProductFindManyArgs>()({
      where,
      orderBy: { model: "asc" },
      include: defaultProductInclude,
      ...(typeof options.offset === "number" ? { skip: options.offset } : {}),
      ...(typeof options.limit === "number" && options.limit > 0
        ? { take: options.limit }
        : {}),
    });

    return Promise.all([
      prisma.product.findMany(queryArgs),
      prisma.product.count({ where }),
    ]).then(([products, total]) => ({
      products: products.map(normalizeProduct),
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
