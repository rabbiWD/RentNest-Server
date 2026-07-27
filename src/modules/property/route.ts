import { Router } from "express";
import { propertyController } from "./controller";

const router = Router();

router.get(
    "/properties",
    propertyController.getAllProperties
);

router.get(
    "/properties/:id",
    propertyController.getPropertyById
);

router.get(
    "/categories",
    propertyController.getAllCategories
);

export const propertyRoutes = router;