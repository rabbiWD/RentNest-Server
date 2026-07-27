import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload } from "./interface";

/**
 * Create Property
 */
const createProperty = async (
    landlordId: string,
    data: ICreatePropertyPayload
) => {
    const property = await prisma.property.create({
        data: {
            ...data,
            landlordId,
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

    return property;
};


export const landlordService = {
    createProperty,
}