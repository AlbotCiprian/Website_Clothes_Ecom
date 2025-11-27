"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
};

export function MockPaymentActions({ orderId }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (outcome: "success" | "failure") => {
    try {
      setIsPending(true);
      setError(null);
      const res = await fetch("/api/mock-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, outcome }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirect) {
        setError(data.error ?? "Simulation failed.");
        setIsPending(false);
        return;
      }
      window.location.href = data.redirect as string;
    } catch (err) {
      console.error(err);
      setError("Unable to simulate payment.");
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handle("success")} disabled={isPending}>
          Simulate success
        </Button>
        <Button variant="secondary" onClick={() => handle("failure")} disabled={isPending}>
          Simulate failure
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
