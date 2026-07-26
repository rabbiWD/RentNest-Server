import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const user = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registration successfully",
        data: {
            user
        }
    })

});

export const authController = {
  registerUser,
  
};