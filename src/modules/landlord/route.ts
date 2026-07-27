import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { landlordController } from "./controller";


const router = Router();


router.post(
  "/",
  auth(UserRole.LANDLORD),
  landlordController.createProperty
);

export const landlordRoutes = router;