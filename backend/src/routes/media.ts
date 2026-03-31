import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { mediaController } from "../controllers/mediaController";

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
