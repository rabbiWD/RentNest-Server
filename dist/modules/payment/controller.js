import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./service";
const createCheckoutSession = catchAsync(async (req, res) => {
    const tenantId = req.user?.id;
    if (!tenantId) {
        throw new Error("Tenant ID not found in session.");
    }
    const result = await paymentService.createCheckoutSession(tenantId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Stripe checkout session created successfully",
        data: result,
    });
});
const confirmPayment = catchAsync(async (req, res) => {
    const tenantId = req.user?.id;
    if (!tenantId) {
        throw new Error("Tenant ID not found in session.");
    }
    const result = await paymentService.confirmPayment(tenantId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment confirmed and rental request activated successfully",
        data: result,
    });
});
const getMyPaymentHistory = catchAsync(async (req, res) => {
    const tenantId = req.user?.id;
    if (!tenantId) {
        throw new Error("Tenant ID not found in session.");
    }
    const result = await paymentService.getMyPaymentHistory(tenantId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result,
    });
});
const getPaymentById = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const paymentId = req.params.id;
    if (!userId || !role) {
        throw new Error("User credentials not found in session.");
    }
    if (!paymentId) {
        throw new Error("Payment ID is required in route params.");
    }
    const result = await paymentService.getPaymentById(paymentId, userId, role);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details retrieved successfully",
        data: result,
    });
});
const handleWebhook = catchAsync(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        throw new Error("Missing stripe-signature header.");
    }
    const result = await paymentService.handleStripeWebhook(signature, req.body);
    res.status(httpStatus.OK).json(result);
});
export const paymentController = {
    createCheckoutSession,
    createPaymentIntent: createCheckoutSession,
    confirmPayment,
    getMyPaymentHistory,
    getPaymentById,
    handleWebhook,
};
