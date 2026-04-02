import { Router } from "express";
import { customerController } from "../controllers/customerController.js";
import { validateCustomerCreate } from "../middleware/validateCustomer.js";

const router = Router();

router.post("/", validateCustomerCreate, customerController.create);
router.get("/", customerController.list);

export default router;
