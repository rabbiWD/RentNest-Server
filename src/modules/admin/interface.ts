
import { UserStatus } from "../../generated/prisma/enums";

export interface IUpdateUserStatus {
  status: UserStatus;
}