import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from 'http-status';


const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  }
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    if (!userId) {
      throw new Error("User Id is required in params");
    }

    const result = await adminService.updateUserStatus(
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  }
);

const getAllProperties = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllProperties();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties retrieved successfully",
      data: result,
    });
  }
);

const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllRentalRequests();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  }
);

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentalRequests
}