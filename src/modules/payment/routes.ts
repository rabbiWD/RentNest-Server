import express, { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./controller";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

router.post(
  "/create",
  auth(UserRole.TENANT),
  paymentController.createCheckoutSession
);

router.post(
  "/create-checkout-session",
  auth(UserRole.TENANT),
  paymentController.createCheckoutSession
);

router.post(
  "/confirm",
  auth(UserRole.TENANT),
  paymentController.confirmPayment
);

router.get(
  "/",
  auth(UserRole.TENANT),
  paymentController.getMyPaymentHistory
);

router.get(
  "/:id",
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  paymentController.getPaymentById
);

export const paymentRoutes = router;
