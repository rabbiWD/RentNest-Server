import { prisma } from "../../lib/prisma";
const createRentalRequest = async (tenantId, data) => {
    // Property খুঁজে বের করা
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: data.propertyId,
        },
    });
    // Property available কিনা check
    if (property.status !== "AVAILABLE") {
        throw new Error("This property is not available for rent.");
    }
    // একই property-তে pending request আছে কিনা check
    const existingRequest = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId: data.propertyId,
            status: "PENDING",
        },
    });
    if (existingRequest) {
        throw new Error("You already have a pending rental request for this property.");
    }
    //   Rental request create
    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            tenantId,
            propertyId: data.propertyId,
            moveInDate: new Date(data.moveInDate),
            duration: Number(data.duration),
            // এখানে user-এর কাছ থেকে monthlyRent নেওয়া হচ্ছে না
            // Property-এর original rentPrice নেওয়া হচ্ছে
            monthlyRent: property.rentPrice,
        },
        include: {
            property: {
                include: {
                    category: true,
                },
            },
        },
    });
    return rentalRequest;
};
const getMyRentalRequests = async (tenantId, query) => {
    const rentalRequests = await prisma.rentalRequest.findMany({
        where: {
            tenantId,
            ...(query.status && {
                status: query.status,
            }),
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
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
const getRentalRequestById = async (rentalRequestId, tenantId) => {
    const rentalRequest = await prisma.rentalRequest.findFirstOrThrow({
        where: {
            id: rentalRequestId,
            tenantId,
        },
        include: {
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
    return rentalRequest;
};
export const rentalService = {
    createRentalRequest,
    getMyRentalRequests,
    getRentalRequestById
};
