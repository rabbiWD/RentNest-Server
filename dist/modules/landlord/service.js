// import { PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { PropertyStatus, RentalRequestStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
/**
 * Create Property
 */
const createProperty = async (landlordId, data) => {
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
const updateProperty = async (propertyId, landlordId, payload) => {
    // First check whether property belongs to this landlord
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId,
            // landlordId,
        },
    });
    if (property.landlordId !== landlordId) {
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
const deleteProperty = async (propertyId, landlordId) => {
    // Check ownership
    const property = await prisma.property.findFirstOrThrow({
        where: {
            id: propertyId,
            landlordId,
        },
    });
    if (property.landlordId !== landlordId) {
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
const getLandlordRequests = async (landlordId) => {
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
// const updateRentalRequest = async (
//   requestId: string,
//   landlordId: string,
//   payload: IUpdateRentalRequestPayload
// ) => {
//   // Check request exists and belongs to landlord's property
//   const rentalRequest = await prisma.rentalRequest.findFirstOrThrow({
//     where: {
//       id: requestId,
//       property: {
//         landlordId,
//       },
//     },
//   });
//   // Only APPROVED or REJECTED allowed
//   if (!["APPROVED", "REJECTED"].includes(payload.status)) {
//     throw new Error("Status must be APPROVED or REJECTED");
//   }
//   // Prevent updating an already processed request
//   if (rentalRequest.status !== "PENDING") {
//     throw new Error("This rental request has already been processed");
//   }
//   const result = await prisma.rentalRequest.update({
//     where: {
//       id: requestId,
//     },
//     data: {
//       status: payload.status,
//       approvedAt:
//         payload.status === "APPROVED"
//           ? new Date()
//           : null,
//     },
//     include: {
//       property: {
//         select: {
//           id: true,
//           title: true,
//           address: true,
//           city: true,
//           rentPrice: true,
//         },
//       },
//       tenant: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           phone: true,
//         },
//       },
//     },
//   });
//   return result;
// };
const updateRentalRequest = async (requestId, landlordId, payload) => {
    const result = await prisma.$transaction(async (tx) => {
        // Check request exists and belongs to landlord
        const rentalRequest = await tx.rentalRequest.findFirstOrThrow({
            where: {
                id: requestId,
                property: {
                    landlordId,
                },
            },
        });
        const currentStatus = rentalRequest.status;
        const nextStatus = payload.status;
        // Prevent same status update
        if (currentStatus === nextStatus) {
            throw new Error(`Rental request is already ${nextStatus}`);
        }
        // Status transition validation
        switch (currentStatus) {
            case RentalRequestStatus.PENDING:
                if (![
                    RentalRequestStatus.APPROVED,
                    RentalRequestStatus.REJECTED,
                ].includes(nextStatus)) {
                    throw new Error("Pending request can only be APPROVED or REJECTED");
                }
                break;
            case RentalRequestStatus.APPROVED:
                if (nextStatus !== RentalRequestStatus.ACTIVE) {
                    throw new Error("Approved request can only become ACTIVE");
                }
                break;
            case RentalRequestStatus.ACTIVE:
                if (nextStatus !== RentalRequestStatus.COMPLETED) {
                    throw new Error("Active request can only become COMPLETED");
                }
                break;
            case RentalRequestStatus.REJECTED:
                throw new Error("Rejected request cannot be updated");
            case RentalRequestStatus.COMPLETED:
                throw new Error("Completed request cannot be updated");
        }
        // Update rental request
        const updatedRequest = await tx.rentalRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: nextStatus,
                approvedAt: nextStatus === RentalRequestStatus.APPROVED
                    ? new Date()
                    : rentalRequest.approvedAt,
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
        // If approved, make property unavailable
        if (nextStatus === RentalRequestStatus.APPROVED) {
            await tx.property.update({
                where: {
                    id: rentalRequest.propertyId,
                },
                data: {
                    status: PropertyStatus.RENTED,
                },
            });
        }
        return updatedRequest;
    });
    return result;
};
export const landlordService = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests,
    updateRentalRequest
};
