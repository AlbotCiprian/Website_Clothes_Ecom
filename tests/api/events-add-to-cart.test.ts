import { describe, expect, it, vi } from "vitest";

const recordAddToCartEventMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/links", () => ({
  recordAddToCartEvent: recordAddToCartEventMock,
}));

import { POST } from "@/app/api/events/add-to-cart/route";

describe("/api/events/add-to-cart", () => {
  it("requires a productId", async () => {
    const request = new Request("http://localhost/api/events/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/missing productid/i);
    expect(recordAddToCartEventMock).not.toHaveBeenCalled();
  });

  it("records valid events", async () => {
    const payload = {
      productId: "prod-1",
      variantId: "variant-2",
      trackerCode: "ABC123",
    };

    const request = new Request("http://localhost/api/events/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({ ok: true });
    expect(recordAddToCartEventMock).toHaveBeenCalledWith(payload);
  });
});
