import { Router } from "express";
import { adminController } from "./controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.get(
  "/users",
  auth(UserRole.ADMIN),
  adminController.getAllUsers
);

export const adminRoutes = router;