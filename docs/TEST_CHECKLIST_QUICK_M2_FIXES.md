## Quick QA Checklist

- Hydration
  - `/`, `/shop`, `/product/[slug]`, `/checkout` load without hydration warnings.
- Cart badge
  - Empty cart: badge hidden or 0.
  - After adding items: badge shows correct count.
- Cart drawer
  - Remove button removes line, subtotal updates.
  - “Finalizează comanda” closes drawer and navigates to `/checkout`.
- Checkout
  - Step 1: remove item works; when empty, continue is disabled.
  - Step 3: payment cards visible; one selectable; security block visible; submit uses selected paymentMethod.
  - Valid submission succeeds without generic errors.
- Admin product creation
  - Create product with empty thumbnail URL succeeds.
  - Create product with valid thumbnail URL succeeds.
- Campaign links
  - Using ADD_TO_CART link clears previous cart and only link products remain.
  - (If multi-product links are configured) all specified products appear with correct quantities.
