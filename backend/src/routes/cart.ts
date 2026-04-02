import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { cartController } from "../controllers/cartController.js";
import {
  validateAddCartItem,
  validateUpdateCartItem,
} from "../middleware/validateCart.js";

const router = Router();

router.use(requireAuth);

router.get("/", cartController.list);
router.post("/", validateAddCartItem, cartController.add);
router.put("/:productModel", validateUpdateCartItem, cartController.update);
router.delete("/:productModel", cartController.remove);

export default router;
