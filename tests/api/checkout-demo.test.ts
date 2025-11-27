import { beforeEach, describe, expect, it, vi } from "vitest";

const orderCreateMock = vi.fn().mockResolvedValue({ id: "order-1" });
const orderItemCreateManyMock = vi.fn().mockResolvedValue({ count: 2 });
const transactionMock = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({
    order: { create: orderCreateMock },
    orderItem: { createMany: orderItemCreateManyMock },
  }),
);

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

import { POST } from "@/app/api/checkout/demo/route";

describe("/api/checkout/demo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 when payload is valid", async () => {
    const payload = {
      customer: {
        name: "Test Customer",
        email: "customer@example.com",
        address: "123 Main Street",
        city: "Bucharest",
        state: "RO",
        postal: "010101",
        shipping: "standard",
      },
      cart: {
        items: [
          {
            productId: "prod-1",
            variantId: "variant-1",
            name: "Midnight Tailored Blazer",
            price: 27900,
            quantity: 1,
          },
        ],
      },
    };

    const request = new Request("http://localhost/api/checkout/demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({ ok: true });
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(orderCreateMock).toHaveBeenCalled();
    expect(orderItemCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          orderId: "order-1",
          productId: "prod-1",
          variantId: "variant-1",
          quantity: 1,
          unitPrice: 27900,
        },
      ],
    });
  });

  it("rejects invalid payloads with 422", async () => {
    const request = new Request("http://localhost/api/checkout/demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {},
        cart: { items: [] },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json).toHaveProperty("error");
    expect(transactionMock).not.toHaveBeenCalled();
  });
});
