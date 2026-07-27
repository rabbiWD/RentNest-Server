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



export const propertyRoutes = router;