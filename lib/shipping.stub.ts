/**
 * Placeholder shipping service hooks.
 * Wire to fulfilment provider when ready.
 */

export type ShippingQuoteRequest = {
  destinationPostalCode: string;
  destinationCountry: string;
  weightInGrams: number;
  speed: "standard" | "express";
};

export async function getShippingQuoteStub(request: ShippingQuoteRequest) {
  const base = request.speed === "express" ? 1800 : 0;
  return {
    amount: base,
    currency: "USD",
    etaDays: request.speed === "express" ? 2 : 5,
  };
}

export async function createShipmentStub(orderId: string) {
  return {
    orderId,
    trackingNumber: `trk_stub_${Date.now()}`,
    labelUrl: null,
  };
}
