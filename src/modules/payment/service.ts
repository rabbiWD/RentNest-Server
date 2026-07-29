import Stripe from "stripe";
import config from "../../config/index";
import { prisma } from "../../lib/prisma";
import {
  PaymentProvider,
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums.js";
import { IConfirmPaymentPayload, ICreatePaymentPayload } from "./interface";

const getStripeInstance = () => {
  if (!config.stripe_secret_key) {
    throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
  }
  return new Stripe(config.stripe_secret_key, {
    apiVersion: "2026-06-24.dahlia",
  });
};

const createPaymentIntent = async (
  tenantId: string,
  payload: ICreatePaymentPayload
) => {
  const { rentalRequestId } = payload;

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: true,
    },
  });

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not authorized to pay for this rental request.");
  }

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new Error(
      `Cannot create payment. Rental request status is ${rentalRequest.status}. It must be APPROVED.`
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      rentalRequestId,
    },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
    throw new Error("Payment for this rental request has already been completed.");
  }

  const totalAmount = Number(rentalRequest.monthlyRent) * rentalRequest.duration;
  const amountInCents = Math.round(totalAmount * 100);

  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
      propertyId: rentalRequest.propertyId,
    },
  });

  const payment = await prisma.payment.upsert({
    where: {
      rentalRequestId,
    },
    update: {
      transactionId: paymentIntent.id,
      amount: totalAmount,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
    create: {
      rentalRequestId,
      transactionId: paymentIntent.id,
      amount: totalAmount,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
    payment,
  };
};

const confirmPayment = async (
  tenantId: string,
  payload: IConfirmPaymentPayload
) => {
  const { paymentIntentId } = payload;

  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      transactionId: paymentIntentId,
    },
    include: {
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },
  });

  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not authorized to confirm this payment.");
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return {
      message: "Payment is already marked as SUCCESS.",
      payment,
    };
  }

  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
        },
      });

      const updatedRentalRequest = await tx.rentalRequest.update({
        where: {
          id: payment.rentalRequestId,
        },
        data: {
          status: RentalRequestStatus.ACTIVE,
        },
      });

      await tx.property.update({
        where: {
          id: payment.rentalRequest.propertyId,
        },
        data: {
          status: PropertyStatus.RENTED,
        },
      });

      return {
        payment: updatedPayment,
        rentalRequest: updatedRentalRequest,
      };
    });

    return result;
  } else {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    throw new Error(
      `Stripe Payment Intent status is '${paymentIntent.status}'. Payment not completed.`
    );
  }
};

const getMyPaymentHistory = async (tenantId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      rentalRequest: {
        tenantId,
      },
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              rentPrice: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getPaymentById = async (paymentId: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              landlordId: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const isTenant = payment.rentalRequest.tenantId === userId;
  const isLandlord = payment.rentalRequest.property.landlordId === userId;
  const isAdmin = role === "ADMIN";

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new Error("You are not authorized to view this payment.");
  }

  return payment;
};

const handleStripeWebhook = async (signature: string, rawBody: Buffer) => {
  const stripe = getStripeInstance();
  const webhookSecret = config.stripe_webhook_secret;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is missing in environment variables.");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook Signature Verification Failed: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { transactionId: paymentIntent.id },
        include: { rentalRequest: true },
      });

      if (payment && payment.status !== PaymentStatus.SUCCESS) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.SUCCESS,
              paidAt: new Date(),
              paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
            },
          });

          await tx.rentalRequest.update({
            where: { id: payment.rentalRequestId },
            data: { status: RentalRequestStatus.ACTIVE },
          });

          await tx.property.update({
            where: { id: payment.rentalRequest.propertyId },
            data: { status: PropertyStatus.RENTED },
          });
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: PaymentStatus.FAILED },
      });
      break;
    }
  }

  return { received: true };
};

export const paymentService = {
  createPaymentIntent,
  confirmPayment,
  getMyPaymentHistory,
  getPaymentById,
  handleStripeWebhook,
};