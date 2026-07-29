
export interface ICreatePaymentPayload {
  rentalRequestId: string;
}

export interface IConfirmPaymentPayload {
  paymentIntentId: string;
}