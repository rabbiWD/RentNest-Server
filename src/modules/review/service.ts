import { RentalRequestStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./interface";
// import { RentalRequestStatus } from "../../../generated/prisma/client";

// const createReview = async (
//   tenantId: string,
//   payload: ICreateReview
// ) => {
//   // Property exists?
//   await prisma.property.findUniqueOrThrow({
//     where: {
//       id: payload.propertyId,
//     },
//   });

//   // Rental must be completed
//   const rental = await prisma.rentalRequest.findFirst({
//     where: {
//       tenantId,
//       propertyId: payload.propertyId,
//       status: RentalRequestStatus.COMPLETED,
//     },
//   });

//   if (!rental) {
//     throw new Error(
//       "You can only review properties after completing a rental."
//     );
//   }

//   // Prevent duplicate review
//   const existingReview = await prisma.review.findFirst({
//     where: {
//       tenantId,
//       propertyId: payload.propertyId,
//     },
//   });

//   if (existingReview) {
//     throw new Error(
//       "You have already reviewed this property."
//     );
//   }

//   // Create review
//   const review = await prisma.review.create({
//     data: {
//       tenantId,
//       propertyId: payload.propertyId,
//       rating: payload.rating,
//       comment: payload.comment,
//     },

//     include: {
//       tenant: {
//         omit: {
//           password: true,
//         },
//       },

//       property: {
//         include: {
//           category: true,
//           landlord: {
//             omit: {
//               password: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return review;
// };

const createReview = async (
  tenantId:string,
  payload:ICreateReview
)=>{

 const result = await prisma.$transaction(async(tx)=>{


   const rental = await tx.rentalRequest.findFirstOrThrow({
     where:{
       tenantId,
       propertyId:payload.propertyId,
       status: RentalRequestStatus.COMPLETED
     }
   });



   const existingReview = await tx.review.findFirst({
     where:{
       tenantId,
       propertyId:payload.propertyId
     }
   });


   if(existingReview){
     throw new Error(
       "You already reviewed this property"
     );
   }



   const review = await tx.review.create({
     data:{
       tenantId,
       propertyId:payload.propertyId,
       rating:payload.rating,
       comment:payload.comment
     }
   });



   return review;

 });


 return result;

};

export const reviewService = {
  createReview,
};