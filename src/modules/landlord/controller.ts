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

export const landlordController = {
    createProperty,
}