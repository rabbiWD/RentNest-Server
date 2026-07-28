import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalController } from "./controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.TENANT),
  rentalController.createRentalRequest
);

router.get(
  "/",
  auth(UserRole.TENANT),
  rentalController.getMyRentalRequests
);

router.get(
  "/:id",
  auth(UserRole.TENANT),
  rentalController.getRentalRequestById
);

export const rentalRoutes = router;