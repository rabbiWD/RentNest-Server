import { Request, Response } from "express";
import { propertyService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from 'http-status';
import { catchAsync } from "../../utils/catchAsync";


const getAllProperties = catchAsync(async (req: Request, res: Response)=> {
    const result = await propertyService.getAllProperties(req.query);

     sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result
    })
});


const getPropertyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await propertyService.getPropertyById(id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Propertyretrieved successfully",
        data: result
    })
});



export const propertyController = {
    getAllProperties,
    getPropertyById
};