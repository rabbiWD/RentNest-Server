import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import  httpStatus  from 'http-status';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: result
    })
});

export const categoryController = {
    getAllCategories
}