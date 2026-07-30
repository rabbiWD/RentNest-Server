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

export const propertyRoutes = router;