import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import  httpStatus  from 'http-status';

const createRentalRequest = catchAsync(
  async (req: Request, res: Response) => {
    const tenantId = req.user?.id;

    if (!tenantId) {
      throw new Error("Tenant Id not found");
    }

    const payload = req.body;

    const result = await rentalService.createRentalRequest(
      tenantId,
      payload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request created successfully",
      data: result,
    });
  }
);

const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    const tenantId = req.user?.id;

    if (!tenantId) {
      throw new Error("Tenant Id not found");
    }

    const query = req.query;
    // as unknown as IRentalRequestQuery;

    const result = await rentalService.getMyRentalRequests(
      tenantId,
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  }
);

export const rentalController = {
    createRentalRequest,
    getMyRentalRequests
}