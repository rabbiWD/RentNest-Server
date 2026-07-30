import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IPropertyQuery } from "./interface";


const getAllProperties = async (query: IPropertyQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;

    const skip = (page - 1) * limit;

    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

    const andConditions: Prisma.PropertyWhereInput[] = [];

    // Search by title, description, city and address
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    city: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    address: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }

    // Location filter
    if (query.location) {
        andConditions.push({
            OR: [
                {
                    city: {
                        contains: query.location,
                        mode: "insensitive",
                    },
                },
                {
                    address: {
                        contains: query.location,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }

    // Minimum & maximum price
    if (query.minPrice || query.maxPrice) {
        andConditions.push({
            rentPrice: {
                ...(query.minPrice && {
                    gte: Number(query.minPrice),
                }),

                ...(query.maxPrice && {
                    lte: Number(query.maxPrice),
                }),
            },
        });
    }

    // Property type filter
    if (query.type) {
        andConditions.push({
            propertyType: {
                equals: query.type,
                mode: "insensitive",
            },
        });
    }

    // Category filter
    if (query.categoryId) {
        andConditions.push({
            categoryId: query.categoryId,
        });
    }

    // Status filter
    if (query.status) {
        andConditions.push({
            status: query.status
        });
    }

    // Default only available properties
    if (!query.status) {
        andConditions.push({
            status: "AVAILABLE",
        });
    }

    const properties = await prisma.property.findMany({
        where: {
            AND: andConditions,
        },

        take: limit,
        skip: skip,

        orderBy: {
            [sortBy]: sortOrder,
        },

        include: {
            category: true,

            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    return properties;
};


const getPropertyById = async (id: string) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id
        },

        include: {
            category: true,

            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },

            reviews: {
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    return property;
};


export const propertyService = {
    getAllProperties,
    getPropertyById,
    
};