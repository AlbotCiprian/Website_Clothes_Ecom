"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CartPayload } from "@/lib/cart";
import { cn } from "@/lib/utils";

const detailsSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Add a valid email"),
  phone: z.string().min(6, "Add a phone number"),
  address: z.string().min(3, "Delivery address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(2, "ZIP/Postal is required").optional().or(z.literal("")),
  note: z.string().max(500).optional(),
  deliveryMethod: z.enum(["COURIER", "PICKUP"]),
  paymentMethod: z.enum(["MIA", "CARD", "APPLE_PAY", "GOOGLE_PAY"]),
});

type FormState = z.infer<typeof detailsSchema>;

const defaultFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  note: "",
  deliveryMethod: "COURIER",
  paymentMethod: "MIA",
};

export function CheckoutFlow({ initialCart }: { initialCart: CartPayload }) {
  const [cart, setCart] = useState<CartPayload>(initialCart);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cartEmpty = cart.items.length === 0;

  const stepMeta = useMemo(
    () => [
      { id: 1, title: "Cart review" },
      { id: 2, title: "Delivery details" },
      { id: 3, title: "Payment" },
    ],
    [],
  );

  const refreshCart = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = (await res.json()) as { cart: CartPayload };
    setCart(data.cart);
  }, []);

  const updateQuantity = useCallback(
    (productVariantId: string, quantity: number) => {
      startTransition(async () => {
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId, quantity }),
        });
        await refreshCart();
      });
    },
    [refreshCart],
  );

  const goNextFromCart = () => {
    if (!cartEmpty) {
      setStep(2);
    }
  };

  const goNextFromDetails = () => {
    const parsed = detailsSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handleSubmit = () => {
    setSubmitError(null);
    const parsed = detailsSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStep(2);
      return;
    }
    setErrors({});
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              note: form.note,
            },
            delivery: {
              address: form.address,
              city: form.city,
              zip: form.zip,
              method: form.deliveryMethod,
            },
            paymentMethod: form.paymentMethod,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.redirect) {
          setSubmitError(data.error ?? "Checkout failed. Try again.");
          return;
        }
        window.location.href = data.redirect as string;
      } catch (error) {
        console.error("submit checkout error", error);
        setSubmitError("Unable to submit. Please try again.");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
      <div className="space-y-4">
        <Stepper stepMeta={stepMeta} activeStep={step} />
        {step === 1 && (
          <CartStep
            cart={cart}
            isPending={isPending}
            onQuantityChange={updateQuantity}
            onNext={goNextFromCart}
          />
        )}
        {step === 2 && (
          <DetailsStep
            form={form}
            errors={errors}
            isPending={isPending}
            onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
            onBack={() => setStep(1)}
            onNext={goNextFromDetails}
          />
        )}
        {step === 3 && (
          <PaymentStep
            form={form}
            errors={errors}
            isPending={isPending}
            onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitError={submitError}
          />
        )}
      </div>

      <SummaryCard cart={cart} isPending={isPending} onRefresh={refreshCart} />
    </div>
  );
}

function Stepper({
  stepMeta,
  activeStep,
}: {
  stepMeta: Array<{ id: number; title: string }>;
  activeStep: number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 p-6">
        {stepMeta.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                activeStep === step.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : step.id < activeStep
                    ? "border-neutral-200 bg-neutral-100 text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-500",
              )}
            >
              {step.id}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                activeStep === step.id ? "text-neutral-900" : "text-neutral-500",
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type CartStepProps = {
  cart: CartPayload;
  isPending: boolean;
  onQuantityChange: (productVariantId: string, quantity: number) => void;
  onNext: () => void;
};

function CartStep({ cart, isPending, onQuantityChange, onNext }: CartStepProps) {
  const cartEmpty = cart.items.length === 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review cart</CardTitle>
        <CardDescription>Adjust items before proceeding.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartEmpty ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-neutral-600">
            Cart is empty. Use a share link to preload items.
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                  <p className="text-xs text-neutral-500">{item.variantLabel}</p>
                  <p className="text-sm font-medium text-neutral-900">
                    MDL {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <QuantityPill
                    value={item.quantity}
                    disabled={isPending}
                    onChange={(next) => onQuantityChange(item.productVariantId, next)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onQuantityChange(item.productVariantId, 0)}
                    disabled={isPending}
                  >
                    Remove
                  </Button>
                  <p className="text-sm font-semibold text-neutral-900">
                    MDL {item.lineTotal.toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={cartEmpty || isPending}>
            Continue to delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type DetailsStepProps = {
  form: FormState;
  errors: Record<string, string>;
  isPending: boolean;
  onChange: (key: keyof FormState, value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function DetailsStep({ form, errors, isPending, onChange, onBack, onNext }: DetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer & delivery</CardTitle>
        <CardDescription>Add contact and shipping details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            value={form.name}
            error={errors.name}
            onChange={(value) => onChange("name", value)}
            required
          />
        <Field
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => onChange("email", value)}
          required
        />
      </div>
      <Field
        label="Phone"
        value={form.phone ?? ""}
        error={errors.phone}
        onChange={(value) => onChange("phone", value)}
        required
      />
      <Field
        label="Delivery address"
        value={form.address}
        error={errors.address}
        onChange={(value) => onChange("address", value)}
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="City"
          value={form.city}
          error={errors.city}
          onChange={(value) => onChange("city", value)}
          required
        />
        <Field
          label="ZIP / Postal"
          value={form.zip ?? ""}
          error={errors.zip}
          onChange={(value) => onChange("zip", value)}
          placeholder="Optional"
        />
        <Field
          label="Delivery note"
          value={form.note ?? ""}
          error={errors.note}
          onChange={(value) => onChange("note", value)}
          placeholder="Optional instructions"
        />
      </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-900">Delivery method</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <DeliveryCard
              title="Courier"
              description="Next-day shipping with tracking."
              selected={form.deliveryMethod === "COURIER"}
              onSelect={() => onChange("deliveryMethod", "COURIER")}
            />
            <DeliveryCard
              title="Pickup"
              description="Collect from showroom. We'll confirm availability."
              selected={form.deliveryMethod === "PICKUP"}
              onSelect={() => onChange("deliveryMethod", "PICKUP")}
            />
          </div>
          {errors.deliveryMethod ? (
            <p className="text-xs text-red-500">{errors.deliveryMethod}</p>
          ) : null}
        </div>
        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={onBack} disabled={isPending}>
            Back
          </Button>
          <Button onClick={onNext} disabled={isPending}>
            Continue to payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type PaymentStepProps = {
  form: FormState;
  errors: Record<string, string>;
  isPending: boolean;
  submitError: string | null;
  onChange: (key: keyof FormState, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

function PaymentStep({
  form,
  errors,
  isPending,
  submitError,
  onChange,
  onBack,
  onSubmit,
}: PaymentStepProps) {
  const cards = [
    { value: "MIA", title: "MIA", subtitle: "Achită instant" },
    { value: "CARD", title: "Card bancar", subtitle: "Online pe site" },
    { value: "CARD", title: "Credit", subtitle: "de la 0%" },
    { value: "CARD", title: "Numerar", subtitle: "la primire" },
    { value: "CARD", title: "Transfer bancar", subtitle: "persoană juridică" },
    { value: "APPLE_PAY", title: "Apple Pay", subtitle: "Plătește cu Apple Pay" },
    { value: "GOOGLE_PAY", title: "Google Pay", subtitle: "Plătește cu Google Pay" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metodă de plată</CardTitle>
        <CardDescription>Selectează o opțiune pentru a continua.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={`${card.title}-${card.subtitle}-${card.value}-${Math.random()}`}
              type="button"
              onClick={() => onChange("paymentMethod", card.value)}
              className={cn(
                "flex h-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:border-neutral-300 hover:shadow",
                form.paymentMethod === card.value
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 bg-white",
              )}
            >
              <span className="text-sm font-semibold text-neutral-900">{card.title}</span>
              <span className="text-xs text-neutral-600">{card.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">Plăți acceptate:</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Apple Pay</span>
          <span>Google Pay</span>
        </div>

        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Siguranța plății</p>
          <ul className="space-y-1 text-[13px]">
            <li>✓ Smart.md protejează datele cardului Dvs</li>
            <li>✓ Toate datele sunt stocate doar în sistemul de plată de la maib</li>
            <li>✓ Folosim tehnologii de criptare a datelor</li>
            <li>✓ Securitatea Dvs. este prioritatea noastră #1</li>
            <li>✓ maib folosește tehnologii avansate în domeniul securității bancare</li>
          </ul>
        </div>

        {errors.paymentMethod ? (
          <p className="text-xs text-red-500">{errors.paymentMethod}</p>
        ) : null}
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={onBack} disabled={isPending}>
            Back
          </Button>
          <Button onClick={onSubmit} disabled={isPending || !form.paymentMethod}>
            Finalizează comanda
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

function Field({ label, value, required, type = "text", placeholder, error, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-900">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <Input
        value={value}
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

type DeliveryCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

function DeliveryCard({ title, description, selected, onSelect }: DeliveryCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition",
        selected
          ? "border-neutral-900 bg-neutral-50"
          : "border-neutral-200 bg-white hover:border-neutral-300",
      )}
    >
      <span className="text-sm font-semibold text-neutral-900">{title}</span>
      <span className="text-xs text-neutral-600">{description}</span>
    </button>
  );
}

type SummaryProps = {
  cart: CartPayload;
  isPending: boolean;
  onRefresh: () => void;
};

function SummaryCard({ cart, isPending, onRefresh }: SummaryProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle>Order summary</CardTitle>
        <CardDescription>Auto-updated from your cart.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          {cart.items.length === 0 ? (
            <p className="text-sm text-neutral-600">No items yet.</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-neutral-900">{item.productName}</p>
                  <p className="text-xs text-neutral-500">{item.variantLabel}</p>
                  <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-neutral-900">MDL {item.lineTotal.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Items</span>
          <span>{cart.totals.itemCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Delivery</span>
          <span>MDL 0.00</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
          <span>Total</span>
          <span>MDL {cart.totals.subtotal.toFixed(2)}</span>
        </div>
        <Button variant="secondary" onClick={onRefresh} disabled={isPending}>
          Refresh cart
        </Button>
        <Badge variant="muted">Payment is mocked in this phase</Badge>
      </CardContent>
    </Card>
  );
}

type QuantityPillProps = {
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
};

function QuantityPill({ value, disabled, onChange }: QuantityPillProps) {
  const handleStep = (delta: number) => {
    const next = Math.max(0, value + delta);
    onChange(next);
  };
  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm font-medium",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => handleStep(-1)}
        disabled={disabled || value <= 0}
        className="px-2 text-neutral-700 transition hover:text-neutral-900 disabled:opacity-40"
      >
        -
      </button>
      <span className="min-w-[2rem] text-center text-neutral-900">{value}</span>
      <button
        type="button"
        onClick={() => handleStep(1)}
        disabled={disabled || value >= 99}
        className="px-2 text-neutral-700 transition hover:text-neutral-900 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
