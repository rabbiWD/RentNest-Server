import { prisma } from "../../lib/prisma";

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

export const adminService = {
    getAllUsers,
}