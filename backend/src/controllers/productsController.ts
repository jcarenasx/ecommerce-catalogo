import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";

function getSingleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseBooleanQuery(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  if (Array.isArray(value)) {
    const firstValue = value[0];
    return typeof firstValue === "string" && (firstValue === "true" || firstValue === "1");
  }

  return false;
}

function parseNumberQuery(value: unknown, fallback?: number): number | undefined {
  if (!value) {
    return fallback;
  }

  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = typeof req.query.category === "string" ? req.query.category : undefined;
      const brand = typeof req.query.brand === "string" ? req.query.brand : undefined;
      const includeInactive = parseBooleanQuery(req.query.includeInactive);
      const limit = parseNumberQuery(req.query.limit);
      const offset = parseNumberQuery(req.query.offset, 0);
      const search = getSingleParam(req.query.search) || undefined;
      const products = await productService.list({
        category,
        brand,
        includeInactive,
        search,
        limit,
        offset,
      });
      return res.json(products);
    } catch (error) {
      next(error);
    }
  },

  async categories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = parseBooleanQuery(req.query.includeInactive);
      const categories = await productService.categories(includeInactive);
      return res.json({ categories });
    } catch (error) {
      next(error);
    }
  },

  async brands(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = parseBooleanQuery(req.query.includeInactive);
      const brands = await productService.brands(includeInactive);
      return res.json({ brands });
    } catch (error) {
      next(error);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const model = getSingleParam(req.params.model);
      const product = await productService.detail(model);
      if (!product) {
        return res.status(404).json({ error: "PRODUCT_NOT_FOUND", message: "No existe el modelo." });
      }
      return res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const product = await productService.create(req.body, files);
      return res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const model = getSingleParam(req.params.model);
      const files = req.files as Express.Multer.File[] | undefined;
      const product = await productService.update(model, req.body, files);
      return res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const model = getSingleParam(req.params.model);
      await productService.remove(model);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
