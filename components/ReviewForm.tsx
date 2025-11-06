"use client";

import { useState, useTransition } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Please share your name."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email.")
    .optional()
    .or(z.literal("")),
  rating: z.coerce.number().min(1).max(5, "Select a rating between 1 and 5."),
  title: z.string().trim().max(120, "Keep headlines under 120 characters.").optional(),
  body: z
    .string()
    .trim()
    .min(20, "Tell us a bit more about your experience (20 characters minimum)."),
});

type ReviewFormProps = {
  productId: string;
};

type FormErrors = Record<string, string>;

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      rating: formData.get("rating"),
      title: formData.get("title"),
      body: formData.get("body"),
    });

    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setStatusType("error");
      setStatusMessage("Please review the highlighted fields.");
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setStatusType("idle");

    const payload = {
      productId,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        setStatusType("success");
        setStatusMessage("Thank you! Your review is pending moderation.");
        (event.currentTarget as HTMLFormElement).reset();
      } catch (error) {
        console.error("Failed to submit review", error);
        setStatusType("error");
        setStatusMessage("We couldn't submit your review. Please try again.");
      }
    });
  };

  return (
    <section
      aria-labelledby="review-form-heading"
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8"
    >
      <header className="space-y-2">
        <h2 id="review-form-heading" className="text-lg font-semibold text-neutral-900">
          Leave a review
        </h2>
        <p className="text-sm text-neutral-600">
          Share how this piece fits into your routine. Reviews appear after a quick moderation pass.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Name"
            name="name"
            required
            error={errors.name}
            inputProps={{ placeholder: "Your name" }}
          />
          <FormField
            label="Email (optional)"
            name="email"
            type="email"
            error={errors.email}
            inputProps={{ placeholder: "you@example.com" }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            as="select"
            label="Rating"
            name="rating"
            required
            defaultValue="5"
            error={errors.rating}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? "star" : "stars"}
              </option>
            ))}
          </FormField>
          <FormField
            label="Headline (optional)"
            name="title"
            error={errors.title}
            inputProps={{ placeholder: "E.g. Perfect studio layer" }}
          />
        </div>

        <FormField
          as="textarea"
          label="Review"
          name="body"
          required
          error={errors.body}
          inputProps={{
            rows: 5,
            placeholder: "How does it fit, feel, or function? Share the details you'd look for.",
          }}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit review"}
          </Button>
          <p className="text-xs text-neutral-500">
            By submitting you agree to share your experience publicly. We never publish your email.
          </p>
          {statusMessage ? (
            <p
              role={statusType === "error" ? "alert" : "status"}
              className={cn(
                "text-xs",
                statusType === "success" ? "text-emerald-600" : "text-neutral-500",
              )}
            >
              {statusMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  as?: "input" | "select" | "textarea";
  type?: string;
  defaultValue?: string;
  children?: React.ReactNode;
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> &
    React.InputHTMLAttributes<HTMLInputElement>;
};

function FormField({
  label,
  name,
  error,
  required,
  as = "input",
  type = "text",
  defaultValue,
  children,
  inputProps,
}: FormFieldProps) {
  const fieldId = `${name}-field`;
  const errorId = `${name}-error`;
  const sharedProps = {
    id: fieldId,
    name,
    required,
    "aria-describedby": error ? errorId : undefined,
    className:
      "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10",
    defaultValue,
  };

  const control =
    as === "textarea" ? (
      <textarea {...(sharedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} {...inputProps} />
    ) : as === "select" ? (
      <select {...(sharedProps as React.SelectHTMLAttributes<HTMLSelectElement>)} {...inputProps}>
        {children}
      </select>
    ) : (
      <input
        type={type}
        {...(sharedProps as React.InputHTMLAttributes<HTMLInputElement>)}
        {...inputProps}
      />
    );

  return (
    <div className="space-y-2 text-sm text-neutral-700">
      <label htmlFor={fieldId} className="font-medium text-neutral-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {control}
      {error ? (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
