import { NextFunction, Request, Response } from "express";
import httpStatus  from 'http-status';
import { Prisma } from "../generated/prisma/client";
// import { Prisma } from "../../generated/prisma/client.js";

export const globalErrorHandler = (err: any, req:Request, res: Response, next: NextFunction)=>{
    console.log("Error:", err)

    let statusCode;
    let errorMessage = err.message || "Internal Server Error";
    let errorName = err.name || "Internal Server Error";
    // let errorDetails = err.stack

    if(err instanceof Prisma.PrismaClientValidationError){
         statusCode = httpStatus.BAD_REQUEST;
         errorMessage = "You have provided incorrect field type or missing fields"
    }else if(err instanceof Prisma.PrismaClientKnownRequestError){
        if(err.code === "P2002"){
            statusCode = httpStatus.BAD_REQUEST,
            errorMessage = "Duplicate Key Error"
        }else if(err.code === "P2003"){
            statusCode = httpStatus.BAD_REQUEST,
            errorMessage = "Foreign Key constraint failed"
        }else if(err.code === "P2025"){
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "An operatin faoled because it depends on one or more records that were required but not found"
        }
    }else if(err instanceof Prisma.PrismaClientInitializationError){
       if(err.errorCode === "P100"){
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Authentication failed against database server. PLease check your Credentials"
       }else if(err.errorCode === "P1001"){
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Can't reach database server"
       }
    }else if(err instanceof Prisma.PrismaClientUnknownRequestError){
         statusCode = httpStatus.INTERNAL_SERVER_ERROR;
         errorMessage = "Error Occured during query execution"
    }




    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        name: errorName,
        message: errorMessage,
        error: err.stack,
      });
}