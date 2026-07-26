import { Router } from "express";
import { authController } from "./controller";

const router = Router();

router.post("/register", authController.registerUser);

// router.post("/login", authController.loginUser)

export const authRoutes = router;