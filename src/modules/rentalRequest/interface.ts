
import { RentalRequestStatus } from "../../../generated/prisma/client";

export interface ICreateRentalRequest {
  propertyId: string;
  moveInDate: string;
  duration: number;
}

export interface IRentalRequestQuery {
  status?: RentalRequestStatus;
}