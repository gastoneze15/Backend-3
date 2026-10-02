import { Router } from "express";
import productsController from "../controllers/productsController.js";

const router = Router();

router.get("/", productsController.findAll);
router.get("/:id/shipping-cost", productsController.getShippingCost);
router.get("/:id", productsController.findById);
router.post("/", productsController.create);
router.put("/:id", productsController.update);
router.delete("/:id", productsController.delete);

export default router;