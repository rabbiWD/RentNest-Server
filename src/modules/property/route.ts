import { Router } from "express";
import { propertyController } from "./controller";

const router = Router();

router.get(
    "/",
    propertyController.getAllProperties
);

router.get(
    "/:id",
    propertyController.getPropertyById
);

router.get(
    "/categories",
    propertyController.getAllCategories
);

export const propertyRoutes = router;