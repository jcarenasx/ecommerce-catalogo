import type { Request, Response, NextFunction } from "express";
import { mediaService } from "../services/mediaService";

export const mediaController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "MISSING_FILES",
          message: "No se enviaron archivos para subir.",
        });
      }
      const urls = await mediaService.save(files);
      return res.status(201).json({ urls });
    } catch (error) {
      next(error);
    }
  },
};
