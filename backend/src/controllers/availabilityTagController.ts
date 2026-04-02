import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { availabilityTagService } from "../services/availabilityTagService.js";

const createSchema = z.object({
  name: z.string().trim().min(1),
});

const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

export const availabilityTagController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await availabilityTagService.list();
      return res.json({ tags });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "INVALID_BODY",
          message: "El cuerpo no cumple la validación.",
          details: parsed.error.format(),
        });
      }

      const tag = await availabilityTagService.create(parsed.data.name);
      return res.status(201).json({ tag });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = paramsSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          error: "INVALID_PARAMS",
          message: "El ID enviado es inválido.",
          details: parsed.error.format(),
        });
      }

      await availabilityTagService.remove(parsed.data.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
