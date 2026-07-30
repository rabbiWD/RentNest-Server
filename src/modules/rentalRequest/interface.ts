
// import { RentalRequestStatus } from "../../../generated/prisma/client";

import { RentalRequestStatus } from "../../generated/prisma/enums";

export interface ICreateRentalRequest {
  propertyId: string;
  moveInDate: string;
  duration: number;
}

export interface IRentalRequestQuery {
  status?: RentalRequestStatus;
}