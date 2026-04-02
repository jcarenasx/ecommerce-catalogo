import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.js";
import { getFirstParam, parseBooleanQuery, parseNumberQuery } from "../utils/requestParsers.js";

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = getFirstParam(req.query.category) || undefined;
      const brand = getFirstParam(req.query.brand) || undefined;
      const includeInactive = parseBooleanQuery(req.query.includeInactive);
      const limit = parseNumberQuery(req.query.limit);
      const offset = parseNumberQuery(req.query.offset, 0);
      const search = getFirstParam(req.query.search) || undefined;
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
      const model = getFirstParam(req.params.model);
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
      const model = getFirstParam(req.params.model);
      const files = req.files as Express.Multer.File[] | undefined;
      const product = await productService.update(model, req.body, files);
      return res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const model = getFirstParam(req.params.model);
      await productService.remove(model);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
