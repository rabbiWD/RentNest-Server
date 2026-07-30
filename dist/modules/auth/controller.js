import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
const registerUser = catchAsync(async (req, res, next) => {
    const payload = req.body;
    const user = await authService.registerUser(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registration successfully",
        data: {
            user
        }
    });
});
const loginUser = catchAsync(async (req, res, next) => {
    const payload = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(payload);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User login successfully",
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});
const getMyProfile = catchAsync(async (req, res, next) => {
    const profile = await authService.getMyProfile(req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: {
            profile
        }
    });
});
const updateMyProfile = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const profile = await authService.updateMyProfile(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile updated successfully",
        data: {
            profile
        }
    });
});
export const authController = {
    registerUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
};
