import { UserStatus } from "../../../generated/prisma/client";

export interface IUpdateUserStatus {
  status: UserStatus;
}