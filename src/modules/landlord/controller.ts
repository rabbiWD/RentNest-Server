import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { landlordService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from 'http-status';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.createProperty(
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
     const propertyId = req.params.id as string;

       if (!propertyId) {
      throw new Error("Property Id is required in params");
    }

    const payload = req.body;

  const result = await landlordService.updateProperty(
      propertyId,
      landlordId as string,
      payload,
      
    // req.user!.id,
    // req.params.id as string,
    // req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully",
    data: result,
  });
});

// const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const landlordId = req.user?.id;
//      const propertyId = req.params.propertyId as string;

//      console.log("PARAMS:", req.params);
// console.log("PROPERTY ID:", req.params.id);


//     if(!propertyId){
//         throw new Error("Property Id Required in Params")
//     }

//    await landlordService.deleteProperty(
//       propertyId,
//       landlordId as string,

//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Property deleted successfully",
//     data: null,
//   });
// });


const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const propertyId = req.params.id;

  if (typeof propertyId !== "string" || propertyId.trim() === "") {
    throw new Error("Property Id Required in Params");
  }

  if (!landlordId) {
    throw new Error("Landlord Id not found");
  }

   await landlordService.deleteProperty(
    propertyId,
    landlordId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: null,
  });
});

const getLandlordRequests = catchAsync(
  async (req: Request, res: Response) => {
    const landlordId = req.user?.id;

    if (!landlordId) {
      throw new Error("Landlord Id not found");
    }

    const result = await landlordService.getLandlordRequests(
      landlordId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  }
);

export const landlordController = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests
}