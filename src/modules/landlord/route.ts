import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { landlordController } from "./controller";


const router = Router();


router.post("/", auth(UserRole.LANDLORD),landlordController.createProperty);

router.put("/:id", auth(UserRole.LANDLORD),
landlordController.updateProperty
);

router.delete("/:id", auth(UserRole.LANDLORD), 
landlordController.deleteProperty
);

router.get("/requests", auth(UserRole.LANDLORD),
);

router.patch("requests/:id", auth(UserRole.LANDLORD),
);

export const landlordRoutes = router;