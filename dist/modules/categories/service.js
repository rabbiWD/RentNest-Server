import { prisma } from "../../lib/prisma";
const createCategory = async (payload) => {
    const isExists = await prisma.category.findUnique({
        where: {
            name: payload.name,
        },
    });
    if (isExists) {
        throw new Error("Category already exists");
    }
    return await prisma.category.create({
        data: payload,
    });
};
// const getAllCategories = async () => {
//     const categories = await prisma.category.findMany({
//         orderBy: {
//             name: "asc"
//         }
//     });
//     return categories;
// };
export const categoryService = {
    createCategory,
    // getAllCategories
};
