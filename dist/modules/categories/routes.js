import { Router } from "express";
import { categoryController } from "./controller";
const router = Router();
router.post("/", categoryController.createCategory);
// router.get(
//     "/",
//     categoryController.getAllCategories
// );
export const categoryRoutes = router;
