import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload, IUpdatePropertyPayload, IUpdateRentalRequestPayload } from "./interface";

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

/**
 * Get all rental requests
 * for logged-in landlord's properties
 */
const getLandlordRequests = async (
    landlordId: string
) => {

    const requests = await prisma.rentalRequest.findMany({
        where: {
            property: {
                landlordId,
            },
        },

        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },

            property: {
                select: {
                    id: true,
                    title: true,
                    address: true,
                    city: true,
                    rentPrice: true,
                    status: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return requests;
};


/**
 * Approve / Reject Rental Request
 */
const updateRentalRequest = async (
  requestId: string,
  landlordId: string,
  payload: IUpdateRentalRequestPayload
) => {
  // Check request exists and belongs to landlord's property
  const rentalRequest = await prisma.rentalRequest.findFirstOrThrow({
    where: {
      id: requestId,
      property: {
        landlordId,
      },
    },
  });

  // Only APPROVED or REJECTED allowed
  if (!["APPROVED", "REJECTED"].includes(payload.status)) {
    throw new Error("Status must be APPROVED or REJECTED");
  }

  // Prevent updating an already processed request
  if (rentalRequest.status !== "PENDING") {
    throw new Error("This rental request has already been processed");
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: payload.status,
      approvedAt:
        payload.status === "APPROVED"
          ? new Date()
          : null,
    },

    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          rentPrice: true,
        },
      },

      tenant: {
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


export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests,
    updateRentalRequest
}