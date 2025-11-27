# Test Cases – Milestone 2

## Product Page Rendering
- **Preconditions:** Database seeded; server running.
- **Steps:** Open product URLs with and without `ref`/`redirect` (e.g., `/product/midnight-tailored-blazer`, `/product/coastal-linen-shirt-dress?ref=CODE&redirect=/checkout`).
- **Expected:** Page renders, no runtime errors (including createdAt serialization), reviews section loads or stays empty gracefully.

## Product Link Robustness
- **Preconditions:** Seeded link trackers; links admin shows generated URLs.
- **Steps:** Open each generated product link from admin export; click Add to cart.
- **Expected:** Correct product shows; if `redirect=/checkout`, after add the user lands on `/checkout`.

## Cart Consistency
- **Preconditions:** Server running.
- **Steps:** Add items from shop grid and from PDP; observe header cart badge; open cart drawer; open `/checkout`.
- **Expected:** Header badge and drawer show same counts/prices as checkout; quantity changes/removals in checkout reflect in header/drawer.

## Checkout Happy Path
- **Preconditions:** Cart has items.
- **Steps:** Complete checkout form with valid data; submit.
- **Expected:** No “Checkout unavailable”; order created; redirect to `/success` (or mock payment success flow if enabled).

## Checkout Failure Path
- **Preconditions:** Cart has items.
- **Steps:** Trigger a known validation error (e.g., missing required field) or simulate payment failure if mock flow used.
- **Expected:** Inline error message shown; request returns JSON `{ error }`; order/payment status set to FAILED in DB when failure simulated.

## Admin Orders Panel
- **Preconditions:** At least one order exists; admin logged in.
- **Steps:** Visit `/admin/orders`; filter by status; open an order detail; change status via dropdown/API.
- **Expected:** Orders list renders with order/payment statuses; detail shows customer/delivery/items/payment; status change persists and reflects in list/detail; layout remains usable on narrow screens.
