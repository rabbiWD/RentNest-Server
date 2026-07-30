import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/route";
import { propertyRoutes } from "./modules/property/route";
import { landlordRoutes } from "./modules/landlord/route";
import { categoryRoutes } from "./modules/categories/routes";
import { rentalRoutes } from "./modules/rentalRequest/routes";
import { adminRoutes } from "./modules/admin/routes";
import { reviewRoutes } from "./modules/review/routes";
// import { paymentRoutes } from "./modules/payment/route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { paymentRoutes } from "./modules/payment/routes";
const app = express();
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));
// Stripe webhook requires raw body for signature verification before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", async (req, res) => {
    res.send("Hello, RestNest!");
});
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/landlord/properties", landlordRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(globalErrorHandler);
export default app;
