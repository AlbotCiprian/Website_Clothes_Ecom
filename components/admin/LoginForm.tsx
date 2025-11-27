"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error";

type LoginFormProps = {
  defaultRedirect?: string;
  helperText?: string;
};

export default function LoginForm({
  defaultRedirect = "/admin/dashboard",
  helperText,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callbackUrl = searchParams?.get("callbackUrl") ?? defaultRedirect;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email")?.toString() ?? "";
      const password = formData.get("password")?.toString() ?? "";

      setStatus("loading");
      setErrorMessage(null);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setStatus("error");
        setErrorMessage("Unexpected authentication response.");
        return;
      }

      if (result.error) {
        setStatus("error");
        setErrorMessage("Invalid email or password. Try again.");
        return;
      }

      window.location.href = result.url ?? callbackUrl;
    },
    [callbackUrl],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2 text-sm text-neutral-700">
        <label htmlFor="email" className="font-medium text-neutral-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClassName}
          placeholder="admin@claroche.shop"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2 text-sm text-neutral-700">
        <label htmlFor="password" className="font-medium text-neutral-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={inputClassName}
          placeholder="Your password"
          autoComplete="current-password"
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Signing in..." : "Sign in"}
      </Button>
      {helperText ? (
        <p className="text-xs text-neutral-500" dangerouslySetInnerHTML={{ __html: helperText }} />
      ) : null}
    </form>
  );
}

const inputClassName = cn(
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10",
);
