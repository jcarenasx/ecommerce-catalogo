import { Router } from "express";
import multer from "multer";
import { config } from "../config/index.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { mediaController } from "../controllers/mediaController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
});

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.array("files"),
  mediaController.upload
);

export default router;
