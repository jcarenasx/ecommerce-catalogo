import type { Express } from "express";
import { mediaRepository } from "../repositories/mediaRepository";

export const mediaService = {
  save(files: Express.Multer.File[]) {
    return mediaRepository.saveFiles(files);
  },
};
