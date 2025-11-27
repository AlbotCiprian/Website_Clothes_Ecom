import { describe, expect, it } from "vitest";

import { cartTotals, lineTotal, type CartSnapshot } from "@/lib/cart";

describe("cart helpers", () => {
  it("computes a line total with quantity taken into account", () => {
    const total = lineTotal({
      id: "line-1",
      productId: "prod-1",
      variantId: "variant-1",
      name: "Test Product",
      price: 12500,
      quantity: 2,
    });

    expect(total).toBe(25000);
  });

  it("aggregates subtotal and item count", () => {
    const snapshot: CartSnapshot = {
      updatedAt: Date.now(),
      items: [
        {
          id: "line-1",
          productId: "prod-1",
          variantId: "variant-1",
          name: "Item A",
          price: 1500,
          quantity: 1,
        },
        {
          id: "line-2",
          productId: "prod-2",
          variantId: "variant-2",
          name: "Item B",
          price: 2000,
          quantity: 2,
        },
      ],
    };

    expect(cartTotals(snapshot)).toEqual({
      subtotal: 5500,
      itemCount: 3,
    });
  });
});
