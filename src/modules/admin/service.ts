// import { UserStatus } from "../../../generated/prisma/enums";
import { UserStatus } from "../../generated/prisma/enums";
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

const getAllProperties = async () => {
  const properties = await prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      category: true,

      landlord: {
        omit: {
          password: true,
        },
      },

      _count: {
        select: {
          rentalRequests: true,
          reviews: true,
        },
      },
    },
  });

  return properties;
};

const getAllRentalRequests = async () => {
  const rentalRequests = await prisma.rentalRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      tenant: {
        omit: {
          password: true,
        },
      },

      property: {
        include: {
          category: true,

          landlord: {
            omit: {
              password: true,
            },
          },
        },
      },

      payment: true,
    },
  });

  return rentalRequests;
};


export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllProperties, 
    getAllRentalRequests
}