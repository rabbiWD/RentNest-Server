
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { reviewController } from "./controller";
import { UserRole } from "../../generated/prisma/enums";
// import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(UserRole.TENANT),
  reviewController.createReview
);

export const reviewRoutes = router;