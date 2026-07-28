import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./service";
import { sendResponse } from "../../utils/sendResponse";


const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const tenantId = req.user?.id;

    if (!tenantId) {
      throw new Error("Tenant Id not found");
    }

    const result = await reviewService.createReview(
      tenantId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
  }
);

export const reviewController = {
  createReview,
};