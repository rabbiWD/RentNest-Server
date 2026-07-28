import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateUserStatus } from "./interface";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },

    include: {
      profile: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const updateUserStatus = async (
  userId: string,
  payload: IUpdateUserStatus
) => {
  // Runtime validation
  if (
    payload.status !== UserStatus.ACTIVE &&
    payload.status !== UserStatus.BANNED
  ) {
    throw new Error(
      "Invalid status. Status must be either ACTIVE or BANNED."
    );
  }

  // Check user
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      status: true,
    },
  });

  // Check current status
  if (user.status === payload.status) {
    throw new Error(
      `User status (${payload.status}) is already up to date.`
    );
  }

  // Update status
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};


export const adminService = {
    getAllUsers,
    updateUserStatus,
}