export interface ICreatePaymentPayload {
  rentalRequestId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface IConfirmPaymentPayload {
  sessionId?: string;
  paymentIntentId?: string;
  rentalRequestId?: string;
}

