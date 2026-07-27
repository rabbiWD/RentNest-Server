import { Router } from "express";
import { categoryController } from "./controller";

const router = Router();

router.get(
    "/",
    categoryController.getAllCategories
);

export const categoryRoutes = router;