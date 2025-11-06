/**
 * Temporary server-only payments stub.
 * Replace with real PSP integration when available.
 */

type PaymentIntentInput = {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
};

export async function createPaymentIntentStub(input: PaymentIntentInput) {
  return {
    id: `pay_stub_${Date.now()}`,
    status: "requires_confirmation",
    amount: input.amount,
    currency: input.currency,
    metadata: input.metadata ?? {},
  };
}

export async function capturePaymentStub(intentId: string) {
  return {
    id: intentId,
    status: "succeeded",
  };
}
