"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  cartTotals,
  clearCart,
  readCart,
  subscribe,
  type CartSnapshot,
} from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Add a valid email address."),
  address: z.string().trim().min(5, "Street address is required."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State or region is required."),
  postal: z.string().trim().min(3, "Postal code is required."),
  shipping: z.enum(["standard", "express"], {
    errorMap: () => ({ message: "Select a shipping method." }),
  }),
  accept: z.literal(true, {
    errorMap: () => ({ message: "Please confirm the order preview." }),
  }),
});

export default function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartSnapshot>(() => readCart());
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    setCart(readCart());
    const unsubscribe = subscribe((nextCart) => setCart(nextCart));
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const viewCart = mounted ? cart : { items: [], updatedAt: 0 };
  const totals = cartTotals(viewCart);
  const cartEmpty = viewCart.items.length === 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const parsed = checkoutSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      postal: formData.get("postal"),
      shipping: formData.get("shipping"),
      accept: formData.get("accept") === "on",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStatusMessage("Review the highlighted fields to continue.");
      return;
    }

    if (cartEmpty || !mounted) {
      setStatusMessage("Your cart is empty. Add items before checking out.");
      return;
    }

    if (!selectedPaymentMethod) {
      setStatusMessage("Select a payment method to continue.");
      return;
    }

    setErrors({});
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: parsed.data,
            cart,
            paymentMethod: selectedPaymentMethod,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            (data && typeof data.error === "string" && data.error) ||
            "Demo checkout is unavailable right now. Please try again shortly.";
          setStatusMessage(message);
          return;
        }

        clearCart();
        router.push("/success");
      } catch (error) {
        console.error("Checkout failed", error);
        setStatusMessage("Demo checkout is unavailable right now. Please try again shortly.");
      }
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
      <form className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Contact</h2>
          <p className="text-sm text-neutral-600">
            We'll send order updates and tracking details to this email.
          </p>
        </div>

        <FormField label="Full name" name="name" error={errors.name} required placeholder="Jamie Rivera" />
        <FormField
          label="Email"
          name="email"
          type="email"
          error={errors.email}
          required
          placeholder="jamie@example.com"
        />

        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Shipping address</h2>
        </div>

        <FormField
          label="Street address"
          name="address"
          error={errors.address}
          required
          placeholder="125 Market Street"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" name="city" error={errors.city} required placeholder="San Francisco" />
          <FormField label="State / Region" name="state" error={errors.state} required placeholder="CA" />
        </div>

        <FormField
          label="Postal code"
          name="postal"
          error={errors.postal}
          required
          placeholder="94103"
        />

        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Delivery speed</h2>
          <p className="text-sm text-neutral-600">Choose the option that suits your schedule.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ShippingOption
            id="shipping-standard"
            label="Standard"
            description="3-5 business days — complimentary"
            value="standard"
            error={errors.shipping}
            defaultChecked
          />
          <ShippingOption
            id="shipping-express"
            label="Express"
            description="1-2 business days — $18"
            value="express"
            error={errors.shipping}
          />
        </div>

        {errors.shipping ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.shipping}
          </p>
        ) : null}

        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Metode de plată</h2>
            <p className="text-sm text-neutral-600">Alege metoda preferată pentru plată.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "MIA", title: "MIA", subtitle: "Achită instant" },
              { key: "CARD", title: "Card bancar", subtitle: "Online pe site" },
              { key: "CREDIT", title: "Credit", subtitle: "de la 0%" },
              { key: "CASH", title: "Numerar", subtitle: "la primire" },
              { key: "BANK_TRANSFER", title: "Transfer Bancar", subtitle: "persoană juridică" },
            ].map((method) => (
              <button
                type="button"
                key={method.key}
                onClick={() => setSelectedPaymentMethod(method.key)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:border-neutral-300 hover:shadow",
                  selectedPaymentMethod === method.key
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 bg-white",
                )}
              >
                <span className="mt-1 h-3 w-3 rounded-full bg-neutral-900" aria-hidden />
                <span>
                  <p className="text-sm font-semibold text-neutral-900">{method.title}</p>
                  <p className="text-xs text-neutral-600">{method.subtitle}</p>
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800">
            {["Visa", "Mastercard", "Maestro", "GPay", "Apple Pay"].map((logo) => (
              <span
                key={logo}
                className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-neutral-200"
              >
                {logo}
              </span>
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            <span className="mt-1">🔒</span>
            <ul className="space-y-1">
              <li>✓ Claroche.md protejează datele cardului Dvs</li>
              <li>✓ Toate datele sunt stocate doar în sistemul de plată de la maib</li>
              <li>✓ Folosim tehnologii de criptare a datelor</li>
              <li>✓ Securitatea Dvs. este prioritatea noastră #1</li>
              <li>✓ maib folosește tehnologii avansate în domeniul securității bancare</li>
            </ul>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <input type="checkbox" name="accept" className="mt-1" />
          <span>
            I confirm my order details are correct and understand this is a demo checkout. No payment
            information will be collected.
          </span>
        </label>
        {errors.accept ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.accept}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending || cartEmpty || !mounted || !selectedPaymentMethod}
          className="w-full"
        >
          {isPending ? "Processing..." : "Place demo order"}
        </Button>
        {statusMessage ? (
          <p className="text-xs text-neutral-500" role="status">
            {statusMessage}
          </p>
        ) : null}
      </form>

      <aside className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>
        {!mounted ? (
          <p className="text-sm text-neutral-500">Loading cart...</p>
        ) : viewCart.items.length === 0 ? (
          <p className="text-sm text-neutral-500">Your cart is empty. Add items to complete checkout.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {viewCart.items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm text-neutral-700">
                  <span className="max-w-[70%] truncate">{item.name}</span>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-neutral-900">{formatMoney(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Estimated shipping</dt>
                <dd>Calculated above</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
};

function FormField({ label, name, error, required, type = "text", placeholder }: FormFieldProps) {
  const id = `${name}-field`;
  return (
    <div className="space-y-2 text-sm text-neutral-700">
      <label htmlFor={id} className="font-medium text-neutral-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ShippingOption({
  id,
  label,
  description,
  value,
  defaultChecked,
  error,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  defaultChecked?: boolean;
  error?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "cursor-pointer rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition hover:border-neutral-400",
        defaultChecked ? "ring-2 ring-neutral-900/10" : "",
      )}
    >
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="radio"
          name="shipping"
          value={value}
          defaultChecked={defaultChecked}
          className="h-4 w-4"
        />
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-neutral-500">{description}</p>
        </div>
      </div>
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}
