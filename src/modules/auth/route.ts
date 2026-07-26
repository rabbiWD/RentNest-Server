import { Router } from "express";
import { authController } from "./controller";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser)

router.get(
  "/me", auth(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  authController.getMyProfile,
);

export const authRoutes = router;