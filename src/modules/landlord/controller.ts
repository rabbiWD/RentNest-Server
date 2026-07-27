import { Request, Response } from "express";
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

const updateProperty = catchAsync(async (req: Request, res: Response) => {
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

export const landlordController = {
    createProperty,
    updateProperty
}