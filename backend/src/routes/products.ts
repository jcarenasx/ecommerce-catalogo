import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  validateProductCreate,
  validateProductUpdate,
} from "../middleware/validateProduct";
import { productsController } from "../controllers/productsController";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
});

router.get("/", productsController.list);
router.get("/categories", productsController.categories);
router.get("/brands", productsController.brands);
router.get("/:model", productsController.detail);
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateProductCreate,
  upload.array("files"),
  productsController.create
);
router.put(
  "/:model",
  requireAuth,
  requireAdmin,
  validateProductUpdate,
  upload.array("files"),
  productsController.update
);
router.delete(
  "/:model",
  requireAuth,
  requireAdmin,
  productsController.remove
);

export default router;
