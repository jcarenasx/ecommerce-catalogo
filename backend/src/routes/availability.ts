import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { availabilityTagController } from "../controllers/availabilityTagController.js";

const router = Router();

router.get("/", availabilityTagController.list);
router.post("/", requireAuth, requireAdmin, availabilityTagController.create);
router.delete("/:id", requireAuth, requireAdmin, availabilityTagController.remove);

export default router;
