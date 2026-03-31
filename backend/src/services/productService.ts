import type { Express } from "express";
import type { Prisma } from "@prisma/client";
import type { ProductInput } from "../types";
import { mediaRepository } from "../repositories/mediaRepository";
import {
  productRepository,
  type ProductFindManyOptions,
} from "../repositories/productRepository";

function normalizeImageUrls(images?: string[] | null): string[] {
  const filtered = (images ?? []).filter((url) => typeof url === "string" && url.trim() !== "");
  const seen = new Set<string>();
  return filtered.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function mergeImageUrls(existing: string[], incoming: string[]): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const url of existing ?? []) {
    if (!seen.has(url)) {
      seen.add(url);
      merged.push(url);
    }
  }
  for (const url of incoming) {
    if (!seen.has(url)) {
      seen.add(url);
      merged.push(url);
    }
  }
  return merged;
}

async function processImages(images?: string[] | null, files?: Express.Multer.File[]) {
  const normalized = normalizeImageUrls(images);
  const uploaded =
    files && files.length > 0 ? await mediaRepository.saveFiles(files) : [];
  return mergeImageUrls(normalized, uploaded);
}

export const productService = {
  async list(options: ProductFindManyOptions = {}) {
    return productRepository.findMany(options);
  },

  async detail(model: string) {
    return productRepository.findUnique(model);
  },

  async categories(includeInactive = false) {
    return productRepository.getDistinctCategories(includeInactive);
  },

  async brands(includeInactive = false) {
    return productRepository.getDistinctBrands(includeInactive);
  },

  async create(input: ProductInput, files?: Express.Multer.File[]) {
    const images = await processImages(input.images, files);
    const payload = {
      name: input.name ?? input.model,
      size: input.size ?? null,
      color: input.color ?? null,
      model: input.model,
      sku: input.sku ?? null,
      priceCents: input.priceCents ?? null,
      paymentLinkWithShipping: input.paymentLinkWithShipping ?? null,
      paymentLinkWithoutShipping: input.paymentLinkWithoutShipping ?? null,
      category: input.category ?? null,
      images,
      active: input.active ?? true,
      brand: input.brand ?? null,
    };
    return productRepository.create(payload);
  },

  async update(model: string, input: ProductInput, files?: Express.Multer.File[]) {
    const images = await processImages(input.images, files);
    const updatePayload: Prisma.ProductUpdateInput = {
      name: input.name ?? input.model,
      model: input.model,
      size: input.size ?? null,
      color: input.color ?? null,
      sku: input.sku ?? null,
      priceCents: input.priceCents ?? null,
      paymentLinkWithShipping: input.paymentLinkWithShipping ?? null,
      paymentLinkWithoutShipping: input.paymentLinkWithoutShipping ?? null,
      category: input.category ?? null,
      images,
    };
    if (input.brand !== undefined) {
      updatePayload.brand = input.brand;
    }
    if (typeof input.active === "boolean") {
      updatePayload.active = input.active;
    }
    return productRepository.update(model, updatePayload);
  },

  async remove(model: string) {
    return productRepository.delete(model);
  },
};
