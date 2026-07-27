import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload, IUpdatePropertyPayload } from "./interface";

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

/**
 * Update Property
 */
const updateProperty = async (
    propertyId: string,
    landlordId: string,
    payload: IUpdatePropertyPayload
) => {

    // First check whether property belongs to this landlord
   const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
            // landlordId,
        },
    });

    if ( property.landlordId !== landlordId) {
    throw new Error("You are not the owner of this property!");
  }

    const result = await prisma.property.update({
        where: {
            id: propertyId,
        },

        data: payload,

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

    return result;
};

const deleteProperty = async (
    propertyId: string,
    landlordId: string
) => {

    // Check ownership
    const property = await prisma.property.findFirstOrThrow({
        where: {
            id: propertyId,
            landlordId,
        },
    });

    if( property.landlordId !== landlordId) {
    throw new Error("You are not the owner of this property!");
  }

     await prisma.property.delete({
        where: {
            id: propertyId,
        },
    });

    return property;
};


export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty
}