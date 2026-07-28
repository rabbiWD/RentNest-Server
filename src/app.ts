
import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/route";
import { propertyRoutes } from "./modules/property/route";
import { landlordRoutes } from "./modules/landlord/route";
import { categoryRoutes } from "./modules/categories/routes";
import { rentalRoutes } from "./modules/rentalRequest/routes";
import { adminRoutes } from "./modules/admin/routes";


const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response)=>{
    res.send("Hello, RestNest!");
});

app.use("/api/auth", authRoutes)
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/landlord/properties", landlordRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);


export default app;