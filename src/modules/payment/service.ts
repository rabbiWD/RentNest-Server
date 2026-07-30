import Stripe from "stripe";
import config from "../../config/index";
import { prisma } from "../../lib/prisma";
import { IConfirmPaymentPayload, ICreatePaymentPayload } from "./interface";
import { PaymentProvider, PaymentStatus, PropertyStatus, RentalRequestStatus } from "../../generated/prisma/enums";

const getStripeInstance = () => {
  if (!config.stripe_secret_key) {
    throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
  }
  return new Stripe(config.stripe_secret_key);
};

const createCheckoutSession = async (
  tenantId: string,
  payload: ICreatePaymentPayload
) => {
  if (!payload || !payload.rentalRequestId) {
    throw new Error("rentalRequestId is required in request body.");
  }

  const { rentalRequestId, successUrl, cancelUrl } = payload;

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

  const appUrl = config.app_url || "http://localhost:3000";
  const defaultSuccessUrl = `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&rental_request_id=${rentalRequestId}`;
  const defaultCancelUrl = `${appUrl}/payment-cancel?rental_request_id=${rentalRequestId}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: rentalRequest.property.title,
            description: `Rent payment for ${rentalRequest.duration} month(s) - ${rentalRequest.property.address}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl || defaultSuccessUrl,
    cancel_url: cancelUrl || defaultCancelUrl,
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
      propertyId: rentalRequest.propertyId,
    },
    client_reference_id: rentalRequest.id,
  });

  const payment = await prisma.payment.upsert({
    where: {
      rentalRequestId,
    },
    update: {
      transactionId: session.id,
      amount: totalAmount,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
    create: {
      rentalRequestId,
      transactionId: session.id,
      amount: totalAmount,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    payment,
  };
};

const confirmPayment = async (
  tenantId: string,
  payload: IConfirmPaymentPayload
) => {
  if (!payload) {
    throw new Error("Session ID or Payment Intent ID is required in request body.");
  }

  const { sessionId, paymentIntentId, rentalRequestId } = payload;
  const idToSearch = sessionId || paymentIntentId || rentalRequestId;

  if (!idToSearch) {
    throw new Error("Session ID, Payment Intent ID, or Rental Request ID is required.");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { transactionId: idToSearch },
        { rentalRequestId: idToSearch },
      ],
    },
    include: {
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment record not found.");
  }

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
  let isPaid = false;
  let paymentMethod = "card";

  if (idToSearch.startsWith("cs_")) {
    const session = await stripe.checkout.sessions.retrieve(idToSearch);
    if (session.payment_status === "paid") {
      isPaid = true;
      paymentMethod = session.payment_method_types?.[0] || "card";
    }
  } else if (idToSearch.startsWith("pi_")) {
    const paymentIntent = await stripe.paymentIntents.retrieve(idToSearch);
    if (paymentIntent.status === "succeeded") {
      isPaid = true;
      paymentMethod = paymentIntent.payment_method_types?.[0] || "card";
    }
  } else if (payment.transactionId?.startsWith("cs_")) {
    const session = await stripe.checkout.sessions.retrieve(payment.transactionId);
    if (session.payment_status === "paid") {
      isPaid = true;
      paymentMethod = session.payment_method_types?.[0] || "card";
    }
  } else if (payment.transactionId?.startsWith("pi_")) {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
    if (paymentIntent.status === "succeeded") {
      isPaid = true;
      paymentMethod = paymentIntent.payment_method_types?.[0] || "card";
    }
  }

  if (isPaid) {
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          paymentMethod,
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

    throw new Error("Stripe checkout status is unpaid. Payment not completed.");
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

  const completePaymentInDb = async (rentalRequestId?: string, transactionId?: string, paymentMethod?: string) => {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          ...(transactionId ? [{ transactionId }] : []),
          ...(rentalRequestId ? [{ rentalRequestId }] : []),
        ],
      },
      include: { rentalRequest: true },
    });

    if (payment && payment.status !== PaymentStatus.SUCCESS) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            paidAt: new Date(),
            paymentMethod: paymentMethod || "card",
            ...(transactionId ? { transactionId } : {}),
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
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const rentalRequestId = (session.metadata?.rentalRequestId as string) || (session.client_reference_id as string);
        await completePaymentInDb(
          rentalRequestId,
          session.id,
          session.payment_method_types?.[0]
        );
      }
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const rentalRequestId = paymentIntent.metadata?.rentalRequestId as string;
      await completePaymentInDb(
        rentalRequestId,
        paymentIntent.id,
        paymentIntent.payment_method_types?.[0]
      );
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
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: { transactionId: session.id },
        data: { status: PaymentStatus.FAILED },
      });
      break;
    }
  }

  return { received: true };
};

export const paymentService = {
  createCheckoutSession,
  createPaymentIntent: createCheckoutSession,
  confirmPayment,
  getMyPaymentHistory,
  getPaymentById,
  handleStripeWebhook,
};
